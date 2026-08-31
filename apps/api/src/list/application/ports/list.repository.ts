import type { List } from '@/list/domain/list';

export abstract class ListRepository {
  abstract findMine(userId: string): Promise<List[]>;
  abstract findOne(userId: string, listId: number): Promise<List | null>;
  abstract create(name: string, ownerId: string): Promise<List>;
  abstract rename(listId: number, name: string): Promise<void>;
  abstract remove(listId: number): Promise<void>;
}
