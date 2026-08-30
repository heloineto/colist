import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType } from '@/iam/domain/auth-type';
import { AUTH_TYPE_KEY } from '@/iam/presentation/http/decorators/auth.decorator';
import { OptionalSessionGuard } from '@/iam/presentation/http/guards/optional-session.guard';
import { SessionGuard } from '@/iam/presentation/http/guards/session.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly guardByType: Record<AuthType, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    sessionGuard: SessionGuard,
    optionalSessionGuard: OptionalSessionGuard
  ) {
    this.guardByType = {
      [AuthType.Session]: sessionGuard,
      [AuthType.None]: optionalSessionGuard,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[] | undefined>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    ) ?? [AuthType.Session];

    for (const authType of authTypes) {
      await this.guardByType[authType].canActivate(context);
    }

    return true;
  }
}
