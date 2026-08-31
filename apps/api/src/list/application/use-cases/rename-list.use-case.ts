import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { CreateListDto } from '@/list/application/dtos/create-list.dto';
import { ListRepository } from '@/list/application/ports/list.repository';
import type { List } from '@/list/domain/list';

@Injectable()
export class RenameListUseCase {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    dto: CreateListDto
  ): Promise<List> {
    await this.listRepository.rename(listId, dto.name);
    await this.activityRecorder.record({
      listId,
      actor,
      action: 'list.renamed',
      targetName: dto.name,
    });

    const list = await this.listRepository.findOne(actor.id, listId);

    if (list === null) throw new NotFoundException('List not found');

    return list;
  }
}
