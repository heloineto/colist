import { Injectable } from '@nestjs/common';
import { ListRepository } from '@/list/application/ports/list.repository';
import type { List } from '@/list/domain/list';

@Injectable()
export class FindListsUseCase {
  constructor(private readonly listRepository: ListRepository) {}

  execute(userId: string): Promise<List[]> {
    return this.listRepository.findMine(userId);
  }
}
