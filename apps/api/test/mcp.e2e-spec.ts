import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Activity } from '@/activity/domain/activity';
import { BetterAuthInstance } from '@/iam/infrastructure/better-auth/better-auth';
import { connectApp, createList, createTestApp, signUp } from './helpers';

let app: INestApplication<App>;
let baseUrl: string;

beforeAll(async () => {
  app = await createTestApp();
  await app.listen(0);
  baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
});

afterAll(async () => {
  await app.close();
});

function decode(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as Record<
    string,
    unknown
  >;
}

/** Re-signs a real access token's claims with the server's own key. */
async function resign(token: string, overrides: Record<string, unknown>) {
  const { auth } = app.get(BetterAuthInstance);
  const { token: signed } = await auth.api.signJWT({
    body: { payload: { ...decode(token), ...overrides } },
  });
  return signed;
}

function postMcp(token?: string) {
  const post = request(app.getHttpServer())
    .post('/api/mcp')
    .set('Accept', 'application/json, text/event-stream');
  return token === undefined
    ? post
    : post.set('Authorization', `Bearer ${token}`);
}

const initialize2025 = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'e2e', version: '1.0.0' },
  },
};

describe('POST /api/mcp', () => {
  it('returns 401 with the resource metadata challenge without a token', async () => {
    const response = await postMcp().send(initialize2025).expect(401);

    expect(response.headers['www-authenticate']).toContain(
      'resource_metadata="http://localhost:5301/.well-known/oauth-protected-resource/api/mcp"'
    );
  });

  it('returns 401 for a garbage token', async () => {
    await postMcp('not-a-jwt').send(initialize2025).expect(401);
  });

  it('returns 401 for a token issued for another resource', async () => {
    const { accessToken } = await connectApp(app, await signUp(app));
    const foreign = await resign(accessToken, {
      aud: 'https://other.test/api/mcp',
    });

    await postMcp(foreign).send(initialize2025).expect(401);
  });

  it('returns 401 for an expired token', async () => {
    const { accessToken } = await connectApp(app, await signUp(app));
    const past = Math.floor(Date.now() / 1000) - 3600;
    const expired = await resign(accessToken, { iat: past, exp: past + 60 });

    await postMcp(expired).send(initialize2025).expect(401);
  });

  it('returns 403 for a foreign Origin', async () => {
    const { accessToken } = await connectApp(app, await signUp(app));

    await postMcp(accessToken)
      .set('Origin', 'https://evil.test')
      .send(initialize2025)
      .expect(403);
  });

  it('accepts a 2025-era initialize', async () => {
    const { accessToken } = await connectApp(app, await signUp(app));

    const response = await postMcp(accessToken)
      .send(initialize2025)
      .expect(200);

    const body =
      /data: (.*)/.exec(response.text)?.[1] ?? JSON.stringify(response.body);
    expect(JSON.parse(body)).toMatchObject({
      id: 1,
      result: {
        protocolVersion: '2025-06-18',
        serverInfo: { name: 'colist' },
      },
    });
  });

  it('serves the tools to an SDK client and records Activities as the user', async () => {
    const owner = await signUp(app);
    const list = await createList(owner);
    const { accessToken } = await connectApp(app, owner);
    // 2026-07-28 era (the 2025 one is covered by the initialize test above).
    const client = new Client(
      { name: 'e2e', version: '1.0.0' },
      { versionNegotiation: { mode: { pin: '2026-07-28' } } }
    );
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`${baseUrl}/api/mcp`), {
        requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
      })
    );

    const { tools } = await client.listTools();
    const added = await client.callTool({
      name: 'add_items',
      arguments: { listId: list.id, items: [{ name: 'Leite' }] },
    });
    await client.close();

    expect(tools).toHaveLength(8);
    expect(added.structuredContent).toMatchObject({
      results: [{ ok: true, item: { name: 'Leite', checked: false } }],
    });
    const response = await owner.agent
      .get(`/api/lists/${list.id}/activities`)
      .expect(200);
    expect((response.body as Activity[])[0]).toMatchObject({
      action: 'item.created',
      actorName: owner.name,
      targetName: 'Leite',
    });
  });

  it('hides lists the user is not a member of', async () => {
    const owner = await signUp(app);
    const list = await createList(owner);
    const { accessToken } = await connectApp(app, await signUp(app));

    const response = await postMcp(accessToken).send({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: 'get_list', arguments: { listId: list.id } },
    });

    const body =
      /data: (.*)/.exec(response.text)?.[1] ?? JSON.stringify(response.body);
    expect(JSON.parse(body)).toMatchObject({
      result: { isError: true, content: [{ text: 'List not found' }] },
    });
  });
});
