import type { Member, Membership } from '@/list/domain/membership';

export abstract class MembershipRepository {
  abstract findOne(userId: string, listId: number): Promise<Membership | null>;
  /** Oldest membership first. */
  abstract findMembers(listId: number): Promise<Member[]>;
  abstract findMemberIds(listId: number): Promise<string[]>;
  abstract add(userId: string, listId: number): Promise<Member | null>;
  abstract remove(userId: string, listId: number): Promise<boolean>;
  abstract promote(userId: string, listId: number): Promise<void>;
}
