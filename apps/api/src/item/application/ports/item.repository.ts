import type { CreateItemDto } from '@/item/application/dtos/create-item.dto';
import type { FindItemsDto } from '@/item/application/dtos/find-items.dto';
import type { UpdateItemDto } from '@/item/application/dtos/update-item.dto';
import type { Item } from '@/item/domain/item';

export abstract class ItemRepository {
  abstract find(listId: number, query: FindItemsDto): Promise<Item[]>;
  abstract findByClientId(
    listId: number,
    clientId: string
  ): Promise<Item | null>;
  /** Null when `categoryId` doesn't belong to the list. */
  abstract create(listId: number, dto: CreateItemDto): Promise<Item | null>;
  /** Null when the item is gone; throws `ForeignCategoryError` on a cross-list category. */
  abstract update(
    listId: number,
    itemId: number,
    dto: UpdateItemDto
  ): Promise<Item | null>;
  abstract remove(listId: number, itemId: number): Promise<Item | null>;
}
