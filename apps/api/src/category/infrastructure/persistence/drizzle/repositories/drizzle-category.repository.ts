import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { CategoryRepository } from '@/category/application/ports/category.repository';
import type { Category } from '@/category/domain/category';
import { categories } from '@/category/infrastructure/persistence/drizzle/category.schema';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';

@Injectable()
export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  find(listId: number): Promise<Category[]> {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.listId, listId))
      .orderBy(asc(categories.name));
  }

  async findOne(listId: number, categoryId: number): Promise<Category | null> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(this.pk(listId, categoryId));

    return rows[0] ?? null;
  }

  async create(listId: number, name: string): Promise<Category> {
    const [category] = await this.db
      .insert(categories)
      .values({ listId, name })
      .returning();

    return category;
  }

  async rename(
    listId: number,
    categoryId: number,
    name: string
  ): Promise<Category | null> {
    const rows = await this.db
      .update(categories)
      .set({ name })
      .where(this.pk(listId, categoryId))
      .returning();

    return rows[0] ?? null;
  }

  async remove(listId: number, categoryId: number): Promise<Category | null> {
    const rows = await this.db
      .delete(categories)
      .where(this.pk(listId, categoryId))
      .returning();

    return rows[0] ?? null;
  }

  private pk(listId: number, categoryId: number) {
    return and(eq(categories.listId, listId), eq(categories.id, categoryId));
  }
}
