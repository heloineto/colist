import type { FindActivitiesDto } from '@/activity/application/dtos/find-activities.dto';
import type { Activity, NewActivity } from '@/activity/domain/activity';

export abstract class ActivityRepository {
  abstract insert(activity: NewActivity): Promise<void>;
  /** Newest first. */
  abstract find(listId: number, query: FindActivitiesDto): Promise<Activity[]>;
}
