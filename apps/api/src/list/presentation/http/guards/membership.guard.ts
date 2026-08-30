import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';
import { ActiveUserSchema } from '@/iam/domain/active-user';
import { REQUEST_USER_KEY } from '@/iam/presentation/http/iam.constants';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import type { MembershipRole } from '@/list/domain/membership';
import { LIST_ROLE_KEY } from '@/list/presentation/http/decorators/list-role.decorator';
import {
  type ListRequest,
  REQUEST_MEMBERSHIP_KEY,
} from '@/list/presentation/http/list.constants';

const ListIdParamSchema = z.coerce.number().int().positive();

/**
 * Resolves `:listId` against the active user's Memberships.
 * Non-members get 404 (a list they can't see doesn't exist); wrong role gets 403.
 */
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membershipRepository: MembershipRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ListRequest>();
    const user = ActiveUserSchema.parse(request[REQUEST_USER_KEY]);
    const listId = ListIdParamSchema.safeParse(request.params.listId);

    if (!listId.success) throw new BadRequestException('Invalid listId');

    const membership = await this.membershipRepository.findOne(
      user.id,
      listId.data
    );

    if (membership === null) throw new NotFoundException('List not found');

    const requiredRole = this.reflector.getAllAndOverride<
      MembershipRole | undefined
    >(LIST_ROLE_KEY, [context.getHandler(), context.getClass()]);

    if (requiredRole !== undefined && membership.role !== requiredRole) {
      throw new ForbiddenException(`Only the ${requiredRole} can do this`);
    }

    request[REQUEST_MEMBERSHIP_KEY] = membership;
    return true;
  }
}
