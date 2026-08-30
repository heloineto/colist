import { z } from 'zod';
import { DateTimeSchema } from '@/common/domain/date-time.schema';
import { MembershipRoleSchema } from '@/list/domain/membership';

export const ListSchema = z.strictObject({
  id: z.int(),
  name: z.string(),
  role: MembershipRoleSchema,
  uncheckedCount: z.int(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export type List = z.infer<typeof ListSchema>;
