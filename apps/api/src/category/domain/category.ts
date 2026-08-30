import { z } from 'zod';
import { DateTimeSchema } from '@/common/domain/date-time.schema';

export const CategorySchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  name: z.string(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export type Category = z.infer<typeof CategorySchema>;
