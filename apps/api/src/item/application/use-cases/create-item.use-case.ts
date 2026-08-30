import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { CreateItemDto } from '@/item/application/dtos/create-item.dto';
import { ItemRepository } from '@/item/application/ports/item.repository';
import type { Item } from '@/item/domain/item';

export type CreateItemResult = { item: Item; created: boolean };

@Injectable()
export class CreateItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    dto: CreateItemDto
  ): Promise<CreateItemResult> {
    const existing = await this.findExisting(listId, dto.clientId);

    if (existing !== null) return { item: existing, created: false };

    const item = await this.itemRepository.create(listId, dto);

    if (item === null) {
      throw new BadRequestException('Category not in this list');
    }

    await this.activityRecorder.record({
      listId,
      actor,
      action: 'item.created',
      targetName: item.name,
    });

    return { item, created: true };
  }

  private findExisting(listId: number, clientId: string | undefined) {
    if (clientId === undefined) return Promise.resolve(null);

    return this.itemRepository.findByClientId(listId, clientId);
  }
}
