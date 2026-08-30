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

describe('POST /api/uploads/presign', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .post('/api/uploads/presign')
      .send({ kind: 'avatar', contentType: 'image/png' })
      .expect(401);
  });

  it('returns 400 on an unsupported content type', async () => {
    const user = await signUp(app);

    await user.agent
      .post('/api/uploads/presign')
      .send({ kind: 'avatar', contentType: 'application/pdf' })
      .expect(400);
  });

  it('presigns a PUT under the user prefix', async () => {
    const user = await signUp(app);

    const response = await user.agent
      .post('/api/uploads/presign')
      .send({ kind: 'avatar', contentType: 'image/png' })
      .expect(201);

    const body = response.body as {
      url: string;
      key: string;
      publicUrl: string;
    };
    expect(body.key).toMatch(
      new RegExp(`^avatars/${user.id}/[0-9a-f-]{36}\\.png$`)
    );
    expect(body.url).toContain('X-Amz-Signature=');
    expect(body.url).toContain(
      encodeURIComponent(body.key).replace(/%2F/g, '/')
    );
    expect(body.publicUrl).toBe(
      `https://colist-test-uploads.s3.us-east-2.amazonaws.com/${body.key}`
    );
  });
});
