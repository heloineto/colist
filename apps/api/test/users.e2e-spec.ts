import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, signUp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/users/lookup', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .get('/api/users/lookup')
      .query({ email: 'a@b.co' })
      .expect(401);
  });

  it('returns 400 on invalid email', async () => {
    const user = await signUp(app);

    await user.agent
      .get('/api/users/lookup')
      .query({ email: 'nope' })
      .expect(400);
  });

  it('returns 404 for unknown email', async () => {
    const user = await signUp(app);

    await user.agent
      .get('/api/users/lookup')
      .query({ email: 'unknown@e2e.colist.test' })
      .expect(404);
  });

  it('returns a preview of another user', async () => {
    const user = await signUp(app);
    const other = await signUp(app);

    const response = await user.agent
      .get('/api/users/lookup')
      .query({ email: other.email.toUpperCase() })
      .expect(200);

    expect(response.body).toEqual({
      id: other.id,
      name: other.name,
      image: null,
    });
  });
});
