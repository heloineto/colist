import type { IncomingHttpHeaders } from 'node:http';
import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { UpdateMeDto } from '@/iam/application/dtos/update-me.dto';
import { UserUpdater } from '@/iam/application/ports/user-updater.port';
import { BetterAuthInstance } from '@/iam/infrastructure/better-auth/better-auth';

@Injectable()
export class BetterAuthUserUpdater implements UserUpdater {
  constructor(private readonly betterAuth: BetterAuthInstance) {}

  async update(headers: IncomingHttpHeaders, dto: UpdateMeDto): Promise<void> {
    await this.betterAuth.auth.api.updateUser({
      body: dto,
      headers: fromNodeHeaders(headers),
    });
  }
}
