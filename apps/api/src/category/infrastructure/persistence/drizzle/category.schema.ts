import { bigint, pgTable, text, unique } from 'drizzle-orm/pg-core';
import {
  createdAt,
  updatedAt,
} from '@/common/infrastructure/persistence/drizzle/columns';
import { lists } from '@/list/infrastructure/persistence/drizzle/list.schema';

export const categories = pgTable(
  'categories',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    listId: bigint('list_id', { mode: 'number' })
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('categories_id_list_id_unique').on(table.id, table.listId)]
);
