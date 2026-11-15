import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { Membership, MembershipRole } from '@/list/domain/membership';

/**
 * The one membership check for every list-scoped entry point (HTTP guard, MCP tools).
 * Non-members get 404 (a list they can't see doesn't exist); wrong role gets 403.
 */
@Injectable()
export class AuthorizeMembershipUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async execute(
    userId: string,
    listId: number,
    role?: MembershipRole
  ): Promise<Membership> {
    const membership = await this.membershipRepository.findOne(userId, listId);

    if (membership === null) throw new NotFoundException('List not found');

    if (role !== undefined && membership.role !== role) {
      throw new ForbiddenException(`Only the ${role} can do this`);
    }

    return membership;
  }
}
