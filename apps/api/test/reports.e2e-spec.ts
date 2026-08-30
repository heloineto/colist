import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createErrorReportDtoFactory,
  createFeedbackDtoFactory,
} from '@/report/test/report.mock';
import { createTestApp, signUp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('POST /api/errors', () => {
  it('accepts anonymous crash captures', async () => {
    await request(app.getHttpServer())
      .post('/api/errors')
      .send(createErrorReportDtoFactory.build())
      .expect(201);
  });

  it('returns 400 without message or error', async () => {
    await request(app.getHttpServer())
      .post('/api/errors')
      .send({ allowCommunication: true })
      .expect(400);
  });

  it('returns 400 on an unknown error field', async () => {
    await request(app.getHttpServer())
      .post('/api/errors')
      .send(
        createErrorReportDtoFactory.build({ error: { extra: 'x' } as never })
      )
      .expect(400);
  });

  it('accepts a signed-in user report with a message', async () => {
    const user = await signUp(app);

    await user.agent
      .post('/api/errors')
      .send({ message: 'The button did nothing', allowCommunication: true })
      .expect(201);
  });
});

describe('POST /api/feedbacks', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .post('/api/feedbacks')
      .send(createFeedbackDtoFactory.build())
      .expect(401);
  });

  it('returns 400 on rating out of range', async () => {
    const user = await signUp(app);

    await user.agent
      .post('/api/feedbacks')
      .send(createFeedbackDtoFactory.build({ rating: 6 }))
      .expect(400);
  });

  it('stores feedback', async () => {
    const user = await signUp(app);

    await user.agent
      .post('/api/feedbacks')
      .send(createFeedbackDtoFactory.build())
      .expect(201);
  });
});
