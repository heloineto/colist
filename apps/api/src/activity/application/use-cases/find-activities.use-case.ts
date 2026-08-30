import { Injectable } from '@nestjs/common';
import {
  ActivityRepository,
  type FindActivitiesQuery,
} from '@/activity/application/ports/activity.repository';
import type { Activity } from '@/activity/domain/activity';

@Injectable()
export class FindActivitiesUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  execute(listId: number, query: FindActivitiesQuery): Promise<Activity[]> {
    return this.activityRepository.find(listId, query);
  }
}
