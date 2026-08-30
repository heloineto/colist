import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSharedList, createTestApp, signUp } from './helpers';

let app: INestApplication<App>;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/lists/:listId/memberships', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent.get(`/api/lists/${list.id}/memberships`).expect(404);
  });

  it('lists members oldest first', async () => {
    const { owner, member, list } = await createSharedList(app);

    const response = await member.agent
      .get(`/api/lists/${list.id}/memberships`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        userId: owner.id,
        role: 'owner',
        name: owner.name,
        email: owner.email,
      }),
      expect.objectContaining({ userId: member.id, role: 'member' }),
    ]);
  });
});

describe('POST /api/lists/:listId/memberships', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, list } = await createSharedList(app);

    await outsider.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: outsider.id })
      .expect(404);
  });

  it('returns 403 for members', async () => {
    const { member, outsider, list } = await createSharedList(app);

    await member.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: outsider.id })
      .expect(403);
  });

  it('returns 400 on a non-uuid', async () => {
    const { owner, list } = await createSharedList(app);

    await owner.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: 'nope' })
      .expect(400);
  });

  it('returns 404 for an unknown user', async () => {
    const { owner, list } = await createSharedList(app);

    await owner.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: '00000000-0000-0000-0000-000000000000' })
      .expect(404);
  });

  it('returns 409 when already a member', async () => {
    const { owner, member, list } = await createSharedList(app);

    await owner.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: member.id })
      .expect(409);
  });

  it('adds a member (owner)', async () => {
    const { owner, outsider, list } = await createSharedList(app);

    const response = await owner.agent
      .post(`/api/lists/${list.id}/memberships`)
      .send({ userId: outsider.id })
      .expect(201);

    expect(response.body).toMatchObject({
      userId: outsider.id,
      role: 'member',
      name: outsider.name,
    });
    await outsider.agent.get(`/api/lists/${list.id}`).expect(200);
  });
});

describe('DELETE /api/lists/:listId/memberships/:userId', () => {
  it('returns 404 for non-members', async () => {
    const { outsider, member, list } = await createSharedList(app);

    await outsider.agent
      .delete(`/api/lists/${list.id}/memberships/${member.id}`)
      .expect(404);
  });

  it('returns 403 for members', async () => {
    const { owner, member, list } = await createSharedList(app);

    await member.agent
      .delete(`/api/lists/${list.id}/memberships/${owner.id}`)
      .expect(403);
  });

  it('returns 400 when removing yourself', async () => {
    const { owner, list } = await createSharedList(app);

    await owner.agent
      .delete(`/api/lists/${list.id}/memberships/${owner.id}`)
      .expect(400);
  });

  it('returns 404 for a non-member target', async () => {
    const { owner, outsider, list } = await createSharedList(app);

    await owner.agent
      .delete(`/api/lists/${list.id}/memberships/${outsider.id}`)
      .expect(404);
  });

  it('removes a member (owner)', async () => {
    const { owner, member, list } = await createSharedList(app);

    await owner.agent
      .delete(`/api/lists/${list.id}/memberships/${member.id}`)
      .expect(204);

    await member.agent.get(`/api/lists/${list.id}`).expect(404);
    const user = await signUp(app);
    expect(user.id).not.toEqual(member.id);
  });
});
