import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '@/category/application/ports/category.repository';
import type { Category } from '@/category/domain/category';

@Injectable()
export class FindCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(listId: number): Promise<Category[]> {
    return this.categoryRepository.find(listId);
  }
}
