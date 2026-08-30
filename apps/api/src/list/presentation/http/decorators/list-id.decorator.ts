import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MembershipSchema } from '@/list/domain/membership';
import {
  type ListRequest,
  REQUEST_MEMBERSHIP_KEY,
} from '@/list/presentation/http/list.constants';

/** The Membership resolved by MembershipGuard. */
export const ActiveMembership = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<ListRequest>();
    return MembershipSchema.parse(request[REQUEST_MEMBERSHIP_KEY]);
  }
);

export const ListId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<ListRequest>();
    return MembershipSchema.parse(request[REQUEST_MEMBERSHIP_KEY]).listId;
  }
);
