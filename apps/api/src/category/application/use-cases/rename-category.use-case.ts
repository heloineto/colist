import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { CreateCategoryDto } from '@/category/application/dtos/create-category.dto';
import { CategoryRepository } from '@/category/application/ports/category.repository';
import type { Category } from '@/category/domain/category';

@Injectable()
export class RenameCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    categoryId: number,
    dto: CreateCategoryDto
  ): Promise<Category> {
    const category = await this.categoryRepository.rename(
      listId,
      categoryId,
      dto.name
    );

    if (category === null) throw new NotFoundException('Category not found');

    await this.activityRecorder.record({
      listId,
      actor,
      action: 'category.updated',
      targetName: category.name,
    });

    return category;
  }
}
