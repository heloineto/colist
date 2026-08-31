import type { List } from '@/list/domain/list';
import { createListDtoFactory } from '@/list/test/list.mock';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { type TestUser, signUp } from './sign-up';

export async function createList(
  owner: TestUser,
  overrides: Partial<{ name: string }> = {}
): Promise<List> {
  const response = await owner.agent
    .post('/api/lists')
    .send(createListDtoFactory.build(overrides))
    .expect(201);

  return response.body as List;
}

export async function addMember(
  owner: TestUser,
  listId: number,
  member: TestUser
): Promise<void> {
  await owner.agent
    .post(`/api/lists/${listId}/memberships`)
    .send({ userId: member.id })
    .expect(201);
}

/** Owner + member + outsider, all signed up, with one shared list. */
export async function createSharedList(app: INestApplication<App>) {
  const [owner, member, outsider] = await Promise.all([
    signUp(app),
    signUp(app),
    signUp(app),
  ]);
  const list = await createList(owner);
  await addMember(owner, list.id, member);

  return { owner, member, outsider, list };
}
