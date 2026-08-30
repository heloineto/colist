import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import {
  type AuthenticatedRequest,
  REQUEST_USER_KEY,
} from '@/iam/presentation/http/iam.constants';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly tokenValidator: TokenValidator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.tokenValidator.validate(request.headers);

    if (user === null) throw new UnauthorizedException('No active session');

    request[REQUEST_USER_KEY] = user;
    return true;
  }
}
