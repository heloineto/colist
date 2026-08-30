import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { UpdateItemDto } from '@/item/application/dtos/update-item.dto';
import { ItemRepository } from '@/item/application/ports/item.repository';
import { ForeignCategoryError } from '@/item/domain/foreign-category-error';
import type { Item } from '@/item/domain/item';

@Injectable()
export class UpdateItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    itemId: number,
    dto: UpdateItemDto
  ): Promise<Item> {
    const item = await this.update(listId, itemId, dto);

    if (item === null) throw new NotFoundException('Item not found');

    await this.activityRecorder.record({
      listId,
      actor,
      action: this.actionFor(dto),
      targetName: item.name,
    });

    return item;
  }

  private async update(listId: number, itemId: number, dto: UpdateItemDto) {
    try {
      return await this.itemRepository.update(listId, itemId, dto);
    } catch (error) {
      if (error instanceof ForeignCategoryError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private actionFor(dto: UpdateItemDto) {
    if (dto.checked === undefined) return 'item.updated';

    return dto.checked ? 'item.checked' : 'item.unchecked';
  }
}
