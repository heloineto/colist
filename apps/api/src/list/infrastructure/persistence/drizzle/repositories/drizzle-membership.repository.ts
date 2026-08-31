import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { user } from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { Member, Membership } from '@/list/domain/membership';
import { memberships } from '@/list/infrastructure/persistence/drizzle/list.schema';

const MEMBER_COLUMNS = {
  userId: memberships.userId,
  listId: memberships.listId,
  role: memberships.role,
  createdAt: memberships.createdAt,
  name: user.name,
  email: user.email,
  image: user.image,
};

@Injectable()
export class DrizzleMembershipRepository implements MembershipRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  async findOne(userId: string, listId: number): Promise<Membership | null> {
    const rows = await this.db
      .select({
        userId: memberships.userId,
        listId: memberships.listId,
        role: memberships.role,
        createdAt: memberships.createdAt,
      })
      .from(memberships)
      .where(this.pk(userId, listId));

    return rows[0] ?? null;
  }

  findMembers(listId: number): Promise<Member[]> {
    return this.db
      .select(MEMBER_COLUMNS)
      .from(memberships)
      .innerJoin(user, eq(user.id, memberships.userId))
      .where(eq(memberships.listId, listId))
      .orderBy(asc(memberships.createdAt), asc(memberships.userId));
  }

  async findMemberIds(listId: number): Promise<string[]> {
    const rows = await this.db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.listId, listId));

    return rows.map((row) => row.userId);
  }

  async add(userId: string, listId: number): Promise<Member | null> {
    const exists = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId));

    if (exists.length === 0) return null;

    await this.db.insert(memberships).values({ userId, listId });

    const rows = await this.db
      .select(MEMBER_COLUMNS)
      .from(memberships)
      .innerJoin(user, eq(user.id, memberships.userId))
      .where(this.pk(userId, listId));

    return rows[0] ?? null;
  }

  async remove(userId: string, listId: number): Promise<void> {
    await this.db.delete(memberships).where(this.pk(userId, listId));
  }

  async replaceOwner(
    userId: string,
    successorId: string,
    listId: number
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(memberships).where(this.pk(userId, listId));
      await tx
        .update(memberships)
        .set({ role: 'owner' })
        .where(this.pk(successorId, listId));
    });
  }

  private pk(userId: string, listId: number) {
    return and(eq(memberships.userId, userId), eq(memberships.listId, listId));
  }
}
