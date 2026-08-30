import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { items } from '@/item/infrastructure/persistence/drizzle/item.schema';
import { ListRepository } from '@/list/application/ports/list.repository';
import type { List } from '@/list/domain/list';
import {
  lists,
  memberships,
} from '@/list/infrastructure/persistence/drizzle/list.schema';

@Injectable()
export class DrizzleListRepository implements ListRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  findMine(userId: string): Promise<List[]> {
    return this.select(userId).orderBy(asc(lists.createdAt));
  }

  async findOne(userId: string, listId: number): Promise<List | null> {
    const rows = await this.select(userId, listId);
    return rows[0] ?? null;
  }

  async create(name: string, ownerId: string): Promise<List> {
    return this.db.transaction(async (tx) => {
      const [list] = await tx.insert(lists).values({ name }).returning();
      await tx
        .insert(memberships)
        .values({ userId: ownerId, listId: list.id, role: 'owner' });

      return { ...list, role: 'owner', uncheckedCount: 0 };
    });
  }

  async rename(listId: number, name: string): Promise<void> {
    await this.db.update(lists).set({ name }).where(eq(lists.id, listId));
  }

  async remove(listId: number): Promise<void> {
    await this.db.delete(lists).where(eq(lists.id, listId));
  }

  private select(userId: string, listId?: number) {
    const uncheckedCount = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(items)
      .where(and(eq(items.listId, lists.id), eq(items.checked, false)));

    return this.db
      .select({
        id: lists.id,
        name: lists.name,
        role: memberships.role,
        uncheckedCount: sql<number>`(${uncheckedCount})`,
        createdAt: lists.createdAt,
        updatedAt: lists.updatedAt,
      })
      .from(lists)
      .innerJoin(memberships, eq(memberships.listId, lists.id))
      .where(
        and(
          eq(memberships.userId, userId),
          listId === undefined ? undefined : eq(lists.id, listId)
        )
      );
  }
}
