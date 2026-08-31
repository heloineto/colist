import type { Category } from '@/category/domain/category';

export abstract class CategoryRepository {
  abstract find(listId: number): Promise<Category[]>;
  abstract create(listId: number, name: string): Promise<Category>;
  abstract rename(
    listId: number,
    categoryId: number,
    name: string
  ): Promise<Category | null>;
  abstract remove(listId: number, categoryId: number): Promise<Category | null>;
}
