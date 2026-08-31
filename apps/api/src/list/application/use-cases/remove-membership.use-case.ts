import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import { MembershipRepository } from '@/list/application/ports/membership.repository';

@Injectable()
export class RemoveMembershipUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(actor: Actor, listId: number, userId: string): Promise<void> {
    if (userId === actor.id) {
      throw new BadRequestException('Use leave to remove yourself');
    }

    const members = await this.membershipRepository.findMembers(listId);
    const target = members.find((member) => member.userId === userId);

    if (target === undefined) throw new NotFoundException('Member not found');

    await this.membershipRepository.remove(userId, listId);
    await this.activityRecorder.record({
      listId,
      actor,
      action: 'member.removed',
      targetName: target.name,
      notify: members.map((member) => member.userId),
    });
  }
}
