import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { categories } from '@/category/infrastructure/persistence/drizzle/category.schema';
import {
  createdAt,
  updatedAt,
} from '@/common/infrastructure/persistence/drizzle/columns';
import { lists } from '@/list/infrastructure/persistence/drizzle/list.schema';

export const items = pgTable(
  'items',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    listId: bigint('list_id', { mode: 'number' })
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    categoryId: bigint('category_id', { mode: 'number' }),
    clientId: uuid('client_id'),
    name: text('name').notNull(),
    amount: integer('amount').notNull().default(1),
    checked: boolean('checked').notNull().default(false),
    details: text('details'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // Migration SQL hand-edited to `ON DELETE SET NULL (category_id)` (PG15 column-subset form).
    foreignKey({
      name: 'items_category_id_list_id_fk',
      columns: [table.categoryId, table.listId],
      foreignColumns: [categories.id, categories.listId],
    }).onDelete('set null'),
    unique('items_list_id_client_id_unique').on(table.listId, table.clientId),
    check('items_amount_check', sql`${table.amount} >= 0`),
  ]
);
