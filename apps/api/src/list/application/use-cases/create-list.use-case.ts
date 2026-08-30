import { Injectable } from '@nestjs/common';
import { ActivityRecorder } from '@/activity/application/ports/activity-recorder.port';
import type { CreateListDto } from '@/list/application/dtos/create-list.dto';
import { ListRepository } from '@/list/application/ports/list.repository';
import type { List } from '@/list/domain/list';

@Injectable()
export class CreateListUseCase {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(ownerId: string, dto: CreateListDto): Promise<List> {
    const list = await this.listRepository.create(dto.name, ownerId);
    await this.activityRecorder.notify(list.id, [ownerId]);
    return list;
  }
}
