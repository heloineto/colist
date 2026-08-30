import { Injectable } from '@nestjs/common';
import type { FindItemsDto } from '@/item/application/dtos/find-items.dto';
import { ItemRepository } from '@/item/application/ports/item.repository';
import type { Item } from '@/item/domain/item';

@Injectable()
export class FindItemsUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  execute(listId: number, query: FindItemsDto): Promise<Item[]> {
    return this.itemRepository.find(listId, query);
  }
}
