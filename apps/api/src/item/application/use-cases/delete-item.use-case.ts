import { Injectable } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import { ItemRepository } from '@/item/application/ports/item.repository';

/** Deleting an already-gone item is a no-op (offline queues replay). */
@Injectable()
export class DeleteItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(actor: Actor, listId: number, itemId: number): Promise<void> {
    const item = await this.itemRepository.remove(listId, itemId);

    if (item === null) return;

    await this.activityRecorder.record({
      listId,
      actor,
      action: 'item.deleted',
      targetName: item.name,
    });
  }
}
