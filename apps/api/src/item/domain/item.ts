import { z } from 'zod';
import { DateTimeSchema } from '@/common/domain/date-time.schema';

export const ItemSchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  categoryId: z.int().nullable(),
  clientId: z.uuid().nullable(),
  name: z.string(),
  amount: z.int(),
  checked: z.boolean(),
  details: z.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export type Item = z.infer<typeof ItemSchema>;
