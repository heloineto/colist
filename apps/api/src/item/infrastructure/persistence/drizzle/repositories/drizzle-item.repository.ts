import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import type { CreateItemDto } from '@/item/application/dtos/create-item.dto';
import type { FindItemsDto } from '@/item/application/dtos/find-items.dto';
import type { UpdateItemDto } from '@/item/application/dtos/update-item.dto';
import { ItemRepository } from '@/item/application/ports/item.repository';
import { ForeignCategoryError } from '@/item/domain/foreign-category-error';
import type { Item } from '@/item/domain/item';
import { items } from '@/item/infrastructure/persistence/drizzle/item.schema';

const PG_FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && error.code === PG_FOREIGN_KEY_VIOLATION) return true;

  return 'cause' in error && isForeignKeyViolation(error.cause);
}

@Injectable()
export class DrizzleItemRepository implements ItemRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  find(listId: number, query: FindItemsDto): Promise<Item[]> {
    const direction = query.order === 'asc' ? asc : desc;
    const column = query.sort === 'name' ? items.name : items.updatedAt;
    const search =
      query.search === undefined
        ? undefined
        : sql`unaccent(${items.name}) ILIKE unaccent(${`%${query.search}%`})`;
    const checked =
      query.checked === undefined
        ? undefined
        : eq(items.checked, query.checked);

    return this.db
      .select()
      .from(items)
      .where(and(eq(items.listId, listId), search, checked))
      .orderBy(direction(column), asc(items.id));
  }

  async findByClientId(listId: number, clientId: string): Promise<Item | null> {
    const rows = await this.db
      .select()
      .from(items)
      .where(and(eq(items.listId, listId), eq(items.clientId, clientId)));

    return rows[0] ?? null;
  }

  async create(listId: number, dto: CreateItemDto): Promise<Item | null> {
    try {
      const [item] = await this.db
        .insert(items)
        .values({
          listId,
          clientId: dto.clientId,
          name: dto.name,
          amount: dto.amount,
          categoryId: dto.categoryId,
          details: dto.details,
        })
        .returning();

      return item;
    } catch (error) {
      if (isForeignKeyViolation(error)) return null;

      throw error;
    }
  }

  async update(
    listId: number,
    itemId: number,
    dto: UpdateItemDto
  ): Promise<Item | null> {
    try {
      const rows = await this.db
        .update(items)
        .set(dto)
        .where(this.pk(listId, itemId))
        .returning();

      return rows[0] ?? null;
    } catch (error) {
      if (isForeignKeyViolation(error)) throw new ForeignCategoryError();

      throw error;
    }
  }

  async remove(listId: number, itemId: number): Promise<Item | null> {
    const rows = await this.db
      .delete(items)
      .where(this.pk(listId, itemId))
      .returning();

    return rows[0] ?? null;
  }

  private pk(listId: number, itemId: number) {
    return and(eq(items.listId, listId), eq(items.id, itemId));
  }
}
