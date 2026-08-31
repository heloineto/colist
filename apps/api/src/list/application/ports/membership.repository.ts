import type { Member, Membership } from '@/list/domain/membership';

export abstract class MembershipRepository {
  abstract findOne(userId: string, listId: number): Promise<Membership | null>;
  /** Oldest membership first. */
  abstract findMembers(listId: number): Promise<Member[]>;
  abstract findMemberIds(listId: number): Promise<string[]>;
  abstract add(userId: string, listId: number): Promise<Member | null>;
  abstract remove(userId: string, listId: number): Promise<void>;
  /** Removes `userId`'s membership and makes `successorId` the owner, atomically. */
  abstract replaceOwner(
    userId: string,
    successorId: string,
    listId: number
  ): Promise<void>;
}
