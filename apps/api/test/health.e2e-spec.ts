import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers';
import type TestAgent from 'supertest/lib/agent';

describe('GET /health', () => {
  let app: INestApplication<App>;
  let api: TestAgent;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    api = request.agent(app.getHttpServer());
  });

  it('returns ok without auth', async () => {
    const response = await api.get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
