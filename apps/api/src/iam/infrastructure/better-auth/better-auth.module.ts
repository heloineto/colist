import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import { UserUpdater } from '@/iam/application/ports/user-updater.port';
import {
  BetterAuthInstance,
  createBetterAuth,
} from '@/iam/infrastructure/better-auth/better-auth';
import { BetterAuthTokenValidator } from '@/iam/infrastructure/better-auth/better-auth-token-validator';
import { BetterAuthUserUpdater } from '@/iam/infrastructure/better-auth/better-auth-user-updater';

@Module({
  providers: [
    {
      provide: BetterAuthInstance,
      inject: [DRIZZLE, ConfigService],
      useFactory: (
        db: Drizzle,
        configService: ConfigService
      ): BetterAuthInstance => ({ auth: createBetterAuth(db, configService) }),
    },
    { provide: TokenValidator, useClass: BetterAuthTokenValidator },
    { provide: UserUpdater, useClass: BetterAuthUserUpdater },
  ],
  exports: [BetterAuthInstance, TokenValidator, UserUpdater],
})
export class BetterAuthModule {}
