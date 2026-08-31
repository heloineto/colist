import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { THROTTLE } from '@/app.module';
import { createErrorReportDtoFactory } from '@/report/test/report.mock';
import { createTestApp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('POST /api/errors (throttled)', () => {
  it('returns 429 past the per-IP limit', async () => {
    const api = request(app.getHttpServer());
    const dto = createErrorReportDtoFactory.build();

    for (let sent = 0; sent < THROTTLE.limit; sent += 1) {
      await api.post('/api/errors').send(dto).expect(201);
    }
    await api.post('/api/errors').send(dto).expect(429);
  });
});
