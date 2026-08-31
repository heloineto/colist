import { z } from 'zod';
import { DateTimeSchema } from '@/common/domain/date-time.schema';

export const MEMBERSHIP_ROLES = ['owner', 'member'] as const;
export const MembershipRoleSchema = z.enum(MEMBERSHIP_ROLES);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

export const MembershipSchema = z.strictObject({
  userId: z.uuid(),
  listId: z.int(),
  role: MembershipRoleSchema,
  createdAt: DateTimeSchema,
});
export type Membership = z.infer<typeof MembershipSchema>;

export const MemberSchema = MembershipSchema.extend({
  name: z.string(),
  email: z.email(),
  image: z.string().nullable(),
});
export type Member = z.infer<typeof MemberSchema>;
