import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createList, createSharedList, createTestApp, signUp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/lists', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer()).get('/api/lists').expect(401);
  });

  it('returns only my lists with role', async () => {
    const { owner, member, outsider, list } = await createSharedList(app);

    const asOwner = await owner.agent.get('/api/lists').expect(200);
    const asMember = await member.agent.get('/api/lists').expect(200);
    const asOutsider = await outsider.agent.get('/api/lists').expect(200);

    expect(asOwner.body).toEqual([
      expect.objectContaining({
        id: list.id,
        role: 'owner',
        uncheckedCount: 0,
      }),
    ]);
    expect(asMember.body).toEqual([
      expect.objectContaining({ id: list.id, role: 'member' }),
    ]);
    expect(asOutsider.body).toEqual([]);
  });
});

describe('POST /api/lists', () => {
  it('requires auth', async () => {
    await request(app.getHttpServer())
      .post('/api/lists')
      .send({ name: 'x' })
      .expect(401);
  });

  it('returns 400 on empty name', async () => {
    const user = await signUp(app);

    await user.agent.post('/api/lists').send({ name: '  ' }).expect(400);
  });

  it('creates a list owned by me', async () => {
    const user = await signUp(app);

    const list = await createList(user, { name: 'Feira' });

    expect(list).toMatchObject({
      name: 'Feira',
      role: 'owner',
      uncheckedCount: 0,
    });
    expect(list.id).toEqual(expect.any(Number));
  });
});

describe('GET /api/lists/:listId', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.get(`/api/lists/${list.id}`).expect(404);
  });

  it('returns 400 on a non-numeric id', async () => {
    const user = await signUp(app);

    await user.agent.get('/api/lists/abc').expect(400);
  });

  it('returns the list for members', async () => {
    const { member, list } = await createSharedList(app);

    const response = await member.agent
      .get(`/api/lists/${list.id}`)
      .expect(200);

    expect(response.body).toMatchObject({ id: list.id, role: 'member' });
  });
});

describe('PATCH /api/lists/:listId', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent
      .patch(`/api/lists/${list.id}`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('lets a member rename', async () => {
    const { member, list } = await createSharedList(app);

    const response = await member.agent
      .patch(`/api/lists/${list.id}`)
      .send({ name: 'Renamed' })
      .expect(200);

    expect(response.body).toMatchObject({ id: list.id, name: 'Renamed' });
  });
});

describe('DELETE /api/lists/:listId', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.delete(`/api/lists/${list.id}`).expect(404);
  });

  it('returns 403 for members', async () => {
    const { member, list } = await createSharedList(app);

    await member.agent.delete(`/api/lists/${list.id}`).expect(403);
  });

  it('deletes for the owner', async () => {
    const { owner, member, list } = await createSharedList(app);

    await owner.agent.delete(`/api/lists/${list.id}`).expect(204);

    await member.agent.get(`/api/lists/${list.id}`).expect(404);
  });
});

describe('POST /api/lists/:listId/leave', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.post(`/api/lists/${list.id}/leave`).expect(404);
  });

  it('removes a member', async () => {
    const { owner, member, list } = await createSharedList(app);

    await member.agent.post(`/api/lists/${list.id}/leave`).expect(204);

    const members = await owner.agent
      .get(`/api/lists/${list.id}/memberships`)
      .expect(200);
    expect(members.body).toHaveLength(1);
  });

  it('promotes the longest-standing member when the owner leaves', async () => {
    const { owner, member, list } = await createSharedList(app);

    await owner.agent.post(`/api/lists/${list.id}/leave`).expect(204);

    const response = await member.agent
      .get(`/api/lists/${list.id}`)
      .expect(200);
    expect(response.body).toMatchObject({ role: 'owner' });
  });

  it('deletes the list when the last member leaves', async () => {
    const user = await signUp(app);
    const list = await createList(user);

    await user.agent.post(`/api/lists/${list.id}/leave`).expect(204);

    await user.agent.get(`/api/lists/${list.id}`).expect(404);
  });
});
