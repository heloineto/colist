import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';
import { ActiveUserSchema } from '@/iam/domain/active-user';
import { REQUEST_USER_KEY } from '@/iam/presentation/http/iam.constants';
import { AuthorizeMembershipUseCase } from '@/list/application/use-cases/authorize-membership.use-case';
import type { MembershipRole } from '@/list/domain/membership';
import { LIST_ROLE_KEY } from '@/list/presentation/http/decorators/list-role.decorator';
import {
  type ListRequest,
  REQUEST_MEMBERSHIP_KEY,
} from '@/list/presentation/http/list.constants';

const ListIdParamSchema = z.coerce.number().int().positive();

/** Resolves `:listId` via `AuthorizeMembershipUseCase` (404 non-members, 403 wrong role). */
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizeMembership: AuthorizeMembershipUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ListRequest>();
    const user = ActiveUserSchema.parse(request[REQUEST_USER_KEY]);
    const listId = ListIdParamSchema.safeParse(request.params.listId);

    if (!listId.success) throw new BadRequestException('Invalid listId');

    const requiredRole = this.reflector.getAllAndOverride<
      MembershipRole | undefined
    >(LIST_ROLE_KEY, [context.getHandler(), context.getClass()]);

    request[REQUEST_MEMBERSHIP_KEY] = await this.authorizeMembership.execute(
      user.id,
      listId.data,
      requiredRole
    );
    return true;
  }
}
