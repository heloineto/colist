import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type TestUser, createSharedList, createTestApp } from './helpers';

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

/** Opens the stream and resolves with the first `list.changed` payload, or null on timeout. */
async function nextListChanged(user: TestUser, timeoutMs: number) {
  const controller = new AbortController();
  const response = await fetch(`${baseUrl}/api/events`, {
    headers: { cookie: user.cookie, accept: 'text/event-stream' },
    signal: controller.signal,
  });
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    for (;;) {
      const chunk = await reader?.read();
      if (chunk === undefined || chunk.done) return null;
      buffer += decoder.decode(chunk.value);
      const match = /event: list\.changed\n(?:id: \d+\n)?data: (.*)\n/.exec(
        buffer
      );
      if (match !== null) return JSON.parse(match[1]) as { listId: number };
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

describe('GET /api/events', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer()).get('/api/events').expect(401);
  });

  it('notifies members when their list changes, not outsiders', async () => {
    const { owner, member, outsider, list } = await createSharedList(app);

    const memberEvent = nextListChanged(member, 3000);
    const outsiderEvent = nextListChanged(outsider, 1500);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await owner.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'Uva' })
      .expect(201);

    expect(await memberEvent).toEqual({ listId: list.id });
    expect(await outsiderEvent).toBeNull();
  });
});
