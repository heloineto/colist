import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createCategoryDtoFactory } from '@/category/test/category.mock';
import { type TestUser, createSharedList, createTestApp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

async function createCategory(user: TestUser, listId: number, name?: string) {
  const response = await user.agent
    .post(`/api/lists/${listId}/categories`)
    .send(createCategoryDtoFactory.build(name === undefined ? {} : { name }))
    .expect(201);

  return response.body as { id: number; name: string };
}

describe('GET /api/lists/:listId/categories', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.get(`/api/lists/${list.id}/categories`).expect(404);
  });

  it('sorts by name with pt-BR collation', async () => {
    const { owner, member, list } = await createSharedList(app);
    await createCategory(owner, list.id, 'Bebidas');
    await createCategory(owner, list.id, 'Açougue');
    await createCategory(owner, list.id, 'abacaxi');

    const response = await member.agent
      .get(`/api/lists/${list.id}/categories`)
      .expect(200);

    expect(
      (response.body as { name: string }[]).map((row) => row.name)
    ).toEqual(['abacaxi', 'Açougue', 'Bebidas']);
  });
});

describe('POST /api/lists/:listId/categories', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent
      .post(`/api/lists/${list.id}/categories`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('returns 400 on empty name', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent
      .post(`/api/lists/${list.id}/categories`)
      .send({ name: '' })
      .expect(400);
  });

  it('creates for members', async () => {
    const { member, list } = await createSharedList(app);

    const category = await createCategory(member, list.id, 'Frios');

    expect(category).toMatchObject({ name: 'Frios', listId: list.id });
  });
});

describe('PATCH /api/lists/:listId/categories/:categoryId', () => {
  it('returns 404 for non-members', async () => {
    const { owner, outsider, list } = await createSharedList(app);
    const category = await createCategory(owner, list.id);

    await outsider.agent
      .patch(`/api/lists/${list.id}/categories/${category.id}`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('returns 404 for a category of another list', async () => {
    const { owner, list } = await createSharedList(app);
    const other = await createSharedList(app);
    const foreign = await createCategory(other.owner, other.list.id);

    await owner.agent
      .patch(`/api/lists/${list.id}/categories/${foreign.id}`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('renames for members', async () => {
    const { owner, member, list } = await createSharedList(app);
    const category = await createCategory(owner, list.id);

    const response = await member.agent
      .patch(`/api/lists/${list.id}/categories/${category.id}`)
      .send({ name: 'Padaria' })
      .expect(200);

    expect(response.body).toMatchObject({ id: category.id, name: 'Padaria' });
  });
});

describe('DELETE /api/lists/:listId/categories/:categoryId', () => {
  it('returns 404 for non-members', async () => {
    const { owner, outsider, list } = await createSharedList(app);
    const category = await createCategory(owner, list.id);

    await outsider.agent
      .delete(`/api/lists/${list.id}/categories/${category.id}`)
      .expect(404);
  });

  it('deletes and detaches items; repeat is a no-op', async () => {
    const { member, list } = await createSharedList(app);
    const category = await createCategory(member, list.id);
    const item = await member.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'Pão', categoryId: category.id })
      .expect(201);

    await member.agent
      .delete(`/api/lists/${list.id}/categories/${category.id}`)
      .expect(204);
    await member.agent
      .delete(`/api/lists/${list.id}/categories/${category.id}`)
      .expect(204);

    const items = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .expect(200);
    expect(items.body).toEqual([
      expect.objectContaining({
        id: (item.body as { id: number }).id,
        categoryId: null,
      }),
    ]);
  });
});
