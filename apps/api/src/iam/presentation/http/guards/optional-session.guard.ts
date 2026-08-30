import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import {
  type AuthenticatedRequest,
  REQUEST_USER_KEY,
} from '@/iam/presentation/http/iam.constants';

/** Public route that still knows who is calling when a session cookie is present. */
@Injectable()
export class OptionalSessionGuard implements CanActivate {
  constructor(private readonly tokenValidator: TokenValidator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request[REQUEST_USER_KEY] =
      (await this.tokenValidator.validate(request.headers)) ?? undefined;
    return true;
  }
}
