import { z } from 'zod';
import { DateTimeSchema } from '@/common/domain/date-time.schema';

export const ACTIVITY_ACTIONS = [
  'list.renamed',
  'item.created',
  'item.updated',
  'item.checked',
  'item.unchecked',
  'item.deleted',
  'category.created',
  'category.updated',
  'category.deleted',
  'member.added',
  'member.removed',
  'member.left',
  'owner.promoted',
] as const;
export const ActivityActionSchema = z.enum(ACTIVITY_ACTIONS);
export type ActivityAction = z.infer<typeof ActivityActionSchema>;

export const ActivitySchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  actorId: z.uuid().nullable(),
  actorName: z.string(),
  action: ActivityActionSchema,
  targetName: z.string().nullable(),
  createdAt: DateTimeSchema,
});
export type Activity = z.infer<typeof ActivitySchema>;

export type NewActivity = Pick<
  Activity,
  'listId' | 'actorId' | 'actorName' | 'action' | 'targetName'
>;
