import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  type TestUser,
  connectApp,
  createTestApp,
  refreshToken,
  signUp,
} from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

type Consent = { id: string; clientId: string; scopes: string[] };

async function consents(user: TestUser): Promise<Consent[]> {
  const response = await user.agent
    .get('/api/auth/oauth2/get-consents')
    .expect(200);
  return response.body as Consent[];
}

describe('DELETE /api/connected-apps/:consentId', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .delete(`/api/connected-apps/${randomUUID()}`)
      .expect(401);
  });

  it("returns 404 for another user's consent", async () => {
    const [owner, outsider] = await Promise.all([signUp(app), signUp(app)]);
    const connected = await connectApp(app, owner);
    const [consent] = await consents(owner);

    await outsider.agent
      .delete(`/api/connected-apps/${consent.id}`)
      .expect(404);

    await refreshToken(app, connected).expect(200);
  });

  it('returns 400 on a non-uuid id', async () => {
    const user = await signUp(app);

    await user.agent.delete('/api/connected-apps/nope').expect(400);
  });

  it('returns 404 for an unknown consent', async () => {
    const user = await signUp(app);

    await user.agent.delete(`/api/connected-apps/${randomUUID()}`).expect(404);
  });

  it('deletes the consent and kills the refresh token', async () => {
    const user = await signUp(app);
    const connected = await connectApp(app, user);
    const [consent] = await consents(user);
    expect(consent).toMatchObject({
      clientId: connected.clientId,
      scopes: expect.arrayContaining(['lists']) as string[],
    });

    await user.agent.delete(`/api/connected-apps/${consent.id}`).expect(204);

    expect(await consents(user)).toEqual([]);
    const refresh = await refreshToken(app, connected).expect(400);
    expect(refresh.body).toMatchObject({ error: 'invalid_grant' });
  });
});
