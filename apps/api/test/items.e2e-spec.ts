import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Item } from '@/item/domain/item';
import { createItemDtoFactory } from '@/item/test/item.mock';
import { type TestUser, createSharedList, createTestApp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

async function createItem(user: TestUser, listId: number, overrides = {}) {
  const response = await user.agent
    .post(`/api/lists/${listId}/items`)
    .send(createItemDtoFactory.build(overrides))
    .expect(201);

  return response.body as Item;
}

const names = (body: unknown) => (body as Item[]).map((item) => item.name);

describe('GET /api/lists/:listId/items', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.get(`/api/lists/${list.id}/items`).expect(404);
  });

  it('returns 400 on an unknown sort', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent
      .get(`/api/lists/${list.id}/items`)
      .query({ sort: 'id' })
      .expect(400);
  });

  it('sorts by name (pt-BR) by default', async () => {
    const { owner, member, list } = await createSharedList(app);
    await createItem(owner, list.id, { name: 'Banana' });
    await createItem(owner, list.id, { name: 'Água' });
    await createItem(owner, list.id, { name: 'abóbora' });

    const response = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .expect(200);

    expect(names(response.body)).toEqual(['abóbora', 'Água', 'Banana']);
  });

  it('searches accent-insensitively', async () => {
    const { member, list } = await createSharedList(app);
    await createItem(member, list.id, { name: 'Açúcar' });
    await createItem(member, list.id, { name: 'Sal' });

    const response = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .query({ search: 'acu' })
      .expect(200);

    expect(names(response.body)).toEqual(['Açúcar']);
  });

  it('filters by checked and sorts by updatedAt desc', async () => {
    const { member, list } = await createSharedList(app);
    const first = await createItem(member, list.id, { name: 'first' });
    const second = await createItem(member, list.id, { name: 'second' });
    await member.agent
      .patch(`/api/lists/${list.id}/items/${first.id}`)
      .send({ checked: true })
      .expect(200);

    const checked = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .query({ checked: 'true' })
      .expect(200);
    const byUpdate = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .query({ sort: 'updatedAt', order: 'desc' })
      .expect(200);

    expect(names(checked.body)).toEqual(['first']);
    expect(names(byUpdate.body)).toEqual([first.name, second.name]);
  });
});

describe('POST /api/lists/:listId/items', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('returns 400 on negative amount', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'x', amount: -1 })
      .expect(400);
  });

  it('returns 400 when the category belongs to another list', async () => {
    const { member, list } = await createSharedList(app);
    const other = await createSharedList(app);
    const foreign = await other.owner.agent
      .post(`/api/lists/${other.list.id}/categories`)
      .send({ name: 'x' })
      .expect(201);

    await member.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'x', categoryId: (foreign.body as { id: number }).id })
      .expect(400);
  });

  it('creates with defaults and bumps the unchecked count', async () => {
    const { member, owner, list } = await createSharedList(app);

    const item = await createItem(member, list.id, { name: 'Leite' });

    expect(item).toMatchObject({
      name: 'Leite',
      checked: false,
      categoryId: null,
      clientId: null,
    });
    const lists = await owner.agent.get('/api/lists').expect(200);
    expect(lists.body).toEqual([
      expect.objectContaining({ uncheckedCount: 1 }),
    ]);
  });

  it('is idempotent on clientId', async () => {
    const { member, list } = await createSharedList(app);
    const clientId = randomUUID();

    const first = await createItem(member, list.id, { name: 'Ovos', clientId });
    const again = await member.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'Ovos', clientId })
      .expect(200);

    expect(again.body).toMatchObject({ id: first.id, clientId });
    const all = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .expect(200);
    expect(all.body).toHaveLength(1);
  });
});

describe('PATCH /api/lists/:listId/items/:itemId', () => {
  it('returns 404 for non-members', async () => {
    const { owner, outsider, list } = await createSharedList(app);
    const item = await createItem(owner, list.id);

    await outsider.agent
      .patch(`/api/lists/${list.id}/items/${item.id}`)
      .send({ checked: true })
      .expect(404);
  });

  it('returns 400 on empty body', async () => {
    const { member, list } = await createSharedList(app);
    const item = await createItem(member, list.id);

    await member.agent
      .patch(`/api/lists/${list.id}/items/${item.id}`)
      .send({})
      .expect(400);
  });

  it('returns 404 when the item is gone', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent
      .patch(`/api/lists/${list.id}/items/999999`)
      .send({ checked: true })
      .expect(404);
  });

  it('checks and bumps updatedAt', async () => {
    const { member, list } = await createSharedList(app);
    const item = await createItem(member, list.id);

    const response = await member.agent
      .patch(`/api/lists/${list.id}/items/${item.id}`)
      .send({ checked: true, amount: 3 })
      .expect(200);

    expect(response.body).toMatchObject({
      id: item.id,
      checked: true,
      amount: 3,
    });
    expect(
      new Date((response.body as Item).updatedAt).getTime()
    ).toBeGreaterThan(new Date(item.updatedAt).getTime());
  });
});

describe('DELETE /api/lists/:listId/items/:itemId', () => {
  it('returns 404 for non-members', async () => {
    const { owner, outsider, list } = await createSharedList(app);
    const item = await createItem(owner, list.id);

    await outsider.agent
      .delete(`/api/lists/${list.id}/items/${item.id}`)
      .expect(404);
  });

  it('deletes; repeat is a no-op', async () => {
    const { member, list } = await createSharedList(app);
    const item = await createItem(member, list.id);

    await member.agent
      .delete(`/api/lists/${list.id}/items/${item.id}`)
      .expect(204);
    await member.agent
      .delete(`/api/lists/${list.id}/items/${item.id}`)
      .expect(204);

    const all = await member.agent
      .get(`/api/lists/${list.id}/items`)
      .expect(200);
    expect(all.body).toEqual([]);
  });
});
