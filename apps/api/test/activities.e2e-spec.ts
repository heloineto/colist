import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Activity } from '@/activity/domain/activity';
import { createSharedList, createTestApp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/lists/:listId/activities', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.get(`/api/lists/${list.id}/activities`).expect(404);
  });

  it('returns 400 on limit above 100', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent
      .get(`/api/lists/${list.id}/activities`)
      .query({ limit: 101 })
      .expect(400);
  });

  it('records mutations newest first and pages with before', async () => {
    const { owner, member, list } = await createSharedList(app);
    const item = await member.agent
      .post(`/api/lists/${list.id}/items`)
      .send({ name: 'Café' })
      .expect(201);
    await member.agent
      .patch(`/api/lists/${list.id}/items/${(item.body as { id: number }).id}`)
      .send({ checked: true })
      .expect(200);
    await member.agent
      .patch(`/api/lists/${list.id}/items/${(item.body as { id: number }).id}`)
      .send({ checked: false })
      .expect(200);
    await owner.agent
      .patch(`/api/lists/${list.id}`)
      .send({ name: 'Mercado' })
      .expect(200);

    const response = await owner.agent
      .get(`/api/lists/${list.id}/activities`)
      .expect(200);
    const activities = response.body as Activity[];

    expect(
      activities.map((activity) => [
        activity.action,
        activity.actorName,
        activity.targetName,
      ])
    ).toEqual([
      ['list.renamed', owner.name, 'Mercado'],
      ['item.unchecked', member.name, 'Café'],
      ['item.checked', member.name, 'Café'],
      ['item.created', member.name, 'Café'],
      ['member.added', owner.name, member.name],
    ]);

    const page = await owner.agent
      .get(`/api/lists/${list.id}/activities`)
      .query({ limit: 1, before: activities[0].id })
      .expect(200);
    expect(page.body).toEqual([
      expect.objectContaining({ action: 'item.unchecked' }),
    ]);
  });
});
