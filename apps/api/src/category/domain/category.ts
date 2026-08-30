import { z } from 'zod';

export const CategorySchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Category = z.infer<typeof CategorySchema>;
