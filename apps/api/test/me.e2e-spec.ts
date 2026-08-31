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

describe('GET /api/me', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer()).get('/api/me').expect(401);
  });

  it('returns the signed-in user', async () => {
    const user = await signUp(app);

    const response = await user.agent.get('/api/me').expect(200);

    expect(response.body).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      image: null,
    });
  });

  it('signs in again with the same password', async () => {
    const user = await signUp(app);
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/auth/sign-in/email')
      .send({ email: user.email, password: user.password })
      .expect(200);
    await agent.get('/api/me').expect(200);
  });
});

describe('GET /api/auth/callback/google', () => {
  it('receives the query string (regression: splat mount dropped it)', async () => {
    // An unknown state must fail as a state MISMATCH, not "state_not_found" -
    // the latter means the query string never reached better-auth.
    const response = await request(app.getHttpServer()).get(
      '/api/auth/callback/google?state=bogus&code=bogus'
    );

    expect(response.headers.location).not.toContain('state_not_found');
  });
});

describe('PATCH /api/me', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .patch('/api/me')
      .send({ name: 'x' })
      .expect(401);
  });

  it('returns 400 on empty body', async () => {
    const user = await signUp(app);

    await user.agent.patch('/api/me').send({}).expect(400);
  });

  it('updates name and image', async () => {
    const user = await signUp(app);
    const image = 'https://example.com/a.png';

    const response = await user.agent
      .patch('/api/me')
      .send({ name: 'New Name', image })
      .expect(200);

    expect(response.body).toMatchObject({ name: 'New Name', image });
    const me = await user.agent.get('/api/me').expect(200);
    expect(me.body).toMatchObject({ name: 'New Name', image });
  });
});
