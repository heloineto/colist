import type { IncomingHttpHeaders } from 'node:http';
import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { BetterAuthInstance } from '@/iam/infrastructure/better-auth/better-auth';

@Injectable()
export class BetterAuthTokenValidator implements TokenValidator {
  constructor(private readonly betterAuth: BetterAuthInstance) {}

  async validate(headers: IncomingHttpHeaders): Promise<ActiveUserType | null> {
    const result = await this.betterAuth.auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (result === null) return null;

    const { id, email, name, image } = result.user;
    return { id, email, name, image: image ?? null };
  }
}
