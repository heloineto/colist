import { z } from 'zod';

export const ActivityActionSchema = z.enum([
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
]);
export type ActivityAction = z.infer<typeof ActivityActionSchema>;

export const ActivitySchema = z.strictObject({
  id: z.int(),
  listId: z.int(),
  actorId: z.uuid().nullable(),
  actorName: z.string(),
  action: ActivityActionSchema,
  targetName: z.string().nullable(),
  createdAt: z.date(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export type NewActivity = Pick<
  Activity,
  'listId' | 'actorId' | 'actorName' | 'action' | 'targetName'
>;
