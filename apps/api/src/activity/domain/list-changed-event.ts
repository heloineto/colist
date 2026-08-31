export const LIST_CHANGED_EVENT = 'list.changed';

export type ListChangedEvent = {
  listId: number;
  /** Members to notify, resolved when the event is emitted. */
  userIds: string[];
};
