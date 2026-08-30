import { z } from 'zod';
import { MembershipRoleSchema } from '@/list/domain/membership';

export const ListSchema = z.strictObject({
  id: z.int(),
  name: z.string(),
  role: MembershipRoleSchema,
  uncheckedCount: z.int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type List = z.infer<typeof ListSchema>;
