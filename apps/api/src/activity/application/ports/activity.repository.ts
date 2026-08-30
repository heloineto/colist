import type { Activity, NewActivity } from '@/activity/domain/activity';

export type FindActivitiesQuery = { limit: number; before?: number };

export abstract class ActivityRepository {
  abstract insert(activity: NewActivity): Promise<void>;
  /** Newest first. */
  abstract find(
    listId: number,
    query: FindActivitiesQuery
  ): Promise<Activity[]>;
}
