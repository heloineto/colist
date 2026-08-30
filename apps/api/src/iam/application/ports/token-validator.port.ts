import type { IncomingHttpHeaders } from 'node:http';
import type { ActiveUserType } from '@/iam/domain/active-user';

export abstract class TokenValidator {
  abstract validate(
    headers: IncomingHttpHeaders
  ): Promise<ActiveUserType | null>;
}
