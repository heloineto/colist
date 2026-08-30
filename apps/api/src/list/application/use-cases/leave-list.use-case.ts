import { Injectable } from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import { ListRepository } from '@/list/application/ports/list.repository';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { Membership } from '@/list/domain/membership';

/** Owner leaving promotes the longest-standing member; the last member leaving deletes the list. */
@Injectable()
export class LeaveListUseCase {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(actor: Actor, membership: Membership): Promise<void> {
    const { listId } = membership;
    const members = await this.membershipRepository.findMembers(listId);
    const successor = members.find((member) => member.userId !== actor.id);

    if (successor === undefined) {
      await this.listRepository.remove(listId);
      await this.activityRecorder.notify(listId, [actor.id]);
      return;
    }

    const memberIds = members.map((member) => member.userId);
    await this.membershipRepository.remove(actor.id, listId);
    await this.activityRecorder.record({
      listId,
      actor,
      action: 'member.left',
      targetName: actor.name,
      notify: memberIds,
    });

    if (membership.role !== 'owner') return;

    await this.membershipRepository.promote(successor.userId, listId);
    await this.activityRecorder.record({
      listId,
      actor,
      action: 'owner.promoted',
      targetName: successor.name,
    });
  }
}
