import { Injectable } from '@nestjs/common';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { Member } from '@/list/domain/membership';

@Injectable()
export class FindMembershipsUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(listId: number): Promise<Member[]> {
    return this.membershipRepository.findMembers(listId);
  }
}
