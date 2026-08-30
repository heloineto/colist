import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityRecorder,
  type Actor,
} from '@/activity/application/ports/activity-recorder.port';
import type { AddMembershipDto } from '@/list/application/dtos/add-membership.dto';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { Member } from '@/list/domain/membership';

@Injectable()
export class AddMembershipUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly activityRecorder: ActivityRecorder
  ) {}

  async execute(
    actor: Actor,
    listId: number,
    dto: AddMembershipDto
  ): Promise<Member> {
    const existing = await this.membershipRepository.findOne(
      dto.userId,
      listId
    );

    if (existing !== null) throw new ConflictException('Already a member');

    const member = await this.membershipRepository.add(dto.userId, listId);

    if (member === null) throw new NotFoundException('User not found');

    await this.activityRecorder.record({
      listId,
      actor,
      action: 'member.added',
      targetName: member.name,
    });

    return member;
  }
}
