import type { ActivityAction } from '@/activity/domain/activity';

export type Actor = { id: string; name: string };

export type RecordInput = {
  listId: number;
  actor: Actor;
  action: ActivityAction;
  targetName?: string | null;
  /** Override the notified members (e.g. include a member about to be removed). */
  notify?: string[];
};

/** Every mutation goes through here: append the Activity, then wake the members' SSE streams. */
export abstract class ActivityRecorder {
  abstract record(input: RecordInput): Promise<void>;
  /** Wake members without an Activity row (list created/deleted). */
  abstract notify(listId: number, userIds?: string[]): Promise<void>;
}
