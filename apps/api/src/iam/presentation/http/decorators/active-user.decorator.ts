import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import {
  ActiveUserSchema,
  type ActiveUserType,
} from '@/iam/domain/active-user';
import {
  type AuthenticatedRequest,
  REQUEST_USER_KEY,
} from '@/iam/presentation/http/iam.constants';

export const ActiveUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveUserType => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return ActiveUserSchema.parse(request[REQUEST_USER_KEY]);
  }
);

export const OptionalActiveUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveUserType | null => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return ActiveUserSchema.nullable().parse(request[REQUEST_USER_KEY] ?? null);
  }
);
