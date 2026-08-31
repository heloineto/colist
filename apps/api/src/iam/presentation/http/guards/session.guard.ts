import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import { IS_PUBLIC_KEY } from '@/iam/presentation/http/decorators/public.decorator';
import {
  type AuthenticatedRequest,
  REQUEST_USER_KEY,
} from '@/iam/presentation/http/iam.constants';

/** Global guard: every route needs a session unless marked `@Public()`. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenValidator: TokenValidator
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.tokenValidator.validate(request.headers);
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (user === null && !isPublic) {
      throw new UnauthorizedException('No active session');
    }

    request[REQUEST_USER_KEY] = user ?? undefined;
    return true;
  }
}
