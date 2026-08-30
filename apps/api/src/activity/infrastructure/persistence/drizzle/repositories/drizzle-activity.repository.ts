import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt } from 'drizzle-orm';
import {
  ActivityRepository,
  type FindActivitiesQuery,
} from '@/activity/application/ports/activity.repository';
import type { Activity, NewActivity } from '@/activity/domain/activity';
import { activities } from '@/activity/infrastructure/persistence/drizzle/activity.schema';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';

@Injectable()
export class DrizzleActivityRepository implements ActivityRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  async insert(activity: NewActivity): Promise<void> {
    await this.db.insert(activities).values(activity);
  }

  find(listId: number, query: FindActivitiesQuery): Promise<Activity[]> {
    const cursor =
      query.before === undefined ? undefined : lt(activities.id, query.before);

    return this.db
      .select()
      .from(activities)
      .where(and(eq(activities.listId, listId), cursor))
      .orderBy(desc(activities.id))
      .limit(query.limit);
  }
}
