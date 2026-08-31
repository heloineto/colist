import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAt,
  updatedAt,
} from '@/common/infrastructure/persistence/drizzle/columns';
import { user } from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import { MEMBERSHIP_ROLES } from '@/list/domain/membership';

export const membershipRole = pgEnum('membership_role', MEMBERSHIP_ROLES);

export const lists = pgTable(
  'lists',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [check('lists_name_check', sql`length(${table.name}) >= 1`)]
);

export const memberships = pgTable(
  'memberships',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    listId: bigint('list_id', { mode: 'number' })
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    role: membershipRole('role').notNull().default('member'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listId] })]
);
