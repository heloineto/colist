import { z } from 'zod';

export const ItemSchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  categoryId: z.int().nullable(),
  clientId: z.uuid().nullable(),
  name: z.string(),
  amount: z.int(),
  checked: z.boolean(),
  details: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Item = z.infer<typeof ItemSchema>;
