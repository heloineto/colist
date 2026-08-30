import { Injectable, NotFoundException } from '@nestjs/common';
import { ListRepository } from '@/list/application/ports/list.repository';
import type { List } from '@/list/domain/list';

@Injectable()
export class FindListUseCase {
  constructor(private readonly listRepository: ListRepository) {}

  async execute(userId: string, listId: number): Promise<List> {
    const list = await this.listRepository.findOne(userId, listId);

    if (list === null) throw new NotFoundException('List not found');

    return list;
  }
}
