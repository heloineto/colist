import { bigint, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt } from '@/common/infrastructure/persistence/drizzle/columns';
import { user } from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import { lists } from '@/list/infrastructure/persistence/drizzle/list.schema';

export const activityAction = pgEnum('activity_action', [
  'list.renamed',
  'item.created',
  'item.updated',
  'item.checked',
  'item.unchecked',
  'item.deleted',
  'category.created',
  'category.updated',
  'category.deleted',
  'member.added',
  'member.removed',
  'member.left',
  'owner.promoted',
]);

export const activities = pgTable('activities', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  listId: bigint('list_id', { mode: 'number' })
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => user.id, { onDelete: 'set null' }),
  actorName: text('actor_name').notNull(),
  action: activityAction('action').notNull(),
  targetName: text('target_name'),
  createdAt: createdAt(),
});
