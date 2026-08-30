import { Injectable } from '@nestjs/common';
import { ActivityRecorder } from '@/activity/application/ports/activity-recorder.port';
import { ListRepository } from '@/list/application/ports/list.repository';
import { MembershipRepository } from '@/list/application/ports/membership.repository';

@Injectable()
export class DeleteListUseCase {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(listId: number): Promise<void> {
    const memberIds = await this.membershipRepository.findMemberIds(listId);
    await this.listRepository.remove(listId);
    await this.activityRecorder.notify(listId, memberIds);
  }
}
