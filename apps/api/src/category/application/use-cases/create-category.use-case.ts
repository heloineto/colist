import { Injectable } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { CreateCategoryDto } from '@/category/application/dtos/create-category.dto';
import { CategoryRepository } from '@/category/application/ports/category.repository';
import type { Category } from '@/category/domain/category';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    dto: CreateCategoryDto
  ): Promise<Category> {
    const category = await this.categoryRepository.create(listId, dto.name);
    await this.activityRecorder.record({
      listId,
      actor,
      action: 'category.created',
      targetName: category.name,
    });

    return category;
  }
}
