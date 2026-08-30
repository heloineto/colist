import { Injectable } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import { CategoryRepository } from '@/category/application/ports/category.repository';

/** Deleting an already-gone category is a no-op (offline queues replay). */
@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    categoryId: number
  ): Promise<void> {
    const category = await this.categoryRepository.remove(listId, categoryId);

    if (category === null) return;

    await this.activityRecorder.record({
      listId,
      actor,
      action: 'category.deleted',
      targetName: category.name,
    });
  }
}
