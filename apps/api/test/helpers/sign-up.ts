import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import type { App } from 'supertest/types';
import { type SignUpDto, signUpDtoFactory } from '@/iam/test/user.mock';

export type TestUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  agent: TestAgent;
  /** Raw `Cookie` header, for clients supertest can't drive (SSE). */
  cookie: string;
};

/** Real sign-up through better-auth; the returned agent carries the session cookie. */
export async function signUp(
  app: INestApplication<App>,
  overrides: Partial<SignUpDto> = {}
): Promise<TestUser> {
  const dto = signUpDtoFactory.build(overrides);
  const agent = request.agent(app.getHttpServer());
  const response = await agent
    .post('/api/auth/sign-up/email')
    .send(dto)
    .expect(200);
  const body = response.body as { user: { id: string } };
  const setCookie = response.headers['set-cookie'] as unknown as string[];
  const cookie = setCookie.map((entry) => entry.split(';')[0]).join('; ');

  return { ...dto, id: body.user.id, agent, cookie };
}
