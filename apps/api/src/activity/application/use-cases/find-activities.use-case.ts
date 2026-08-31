import { Injectable } from '@nestjs/common';
import type { FindActivitiesDto } from '@/activity/application/dtos/find-activities.dto';
import { ActivityRepository } from '@/activity/application/ports/activity.repository';
import type { Activity } from '@/activity/domain/activity';

@Injectable()
export class FindActivitiesUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  execute(listId: number, query: FindActivitiesDto): Promise<Activity[]> {
    return this.activityRepository.find(listId, query);
  }
}
