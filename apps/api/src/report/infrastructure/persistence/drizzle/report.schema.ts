import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAt,
  updatedAt,
} from '@/common/infrastructure/persistence/drizzle/columns';
import { user } from '@/iam/infrastructure/persistence/drizzle/iam.schema';

export const feedbacks = pgTable(
  'feedbacks',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
    message: text('message').notNull(),
    rating: integer('rating'),
    files: text('files').array().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      'feedbacks_rating_check',
      sql`${table.rating} IS NULL OR ${table.rating} BETWEEN 1 AND 5`
    ),
  ]
);

export const errors = pgTable('errors', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
  message: text('message'),
  error: jsonb('error'),
  allowCommunication: boolean('allow_communication').notNull().default(false),
  files: text('files').array().notNull().default([]),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
