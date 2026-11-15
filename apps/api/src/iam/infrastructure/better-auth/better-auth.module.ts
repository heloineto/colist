import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { McpAuthenticator } from '@/iam/application/ports/mcp-authenticator.port';
import { TokenValidator } from '@/iam/application/ports/token-validator.port';
import { UserUpdater } from '@/iam/application/ports/user-updater.port';
import {
  BetterAuthInstance,
  createBetterAuth,
  getMcpResource,
} from '@/iam/infrastructure/better-auth/better-auth';
import { BetterAuthMcpAuthenticator } from '@/iam/infrastructure/better-auth/better-auth-mcp-authenticator';
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
      ): BetterAuthInstance => ({
        auth: createBetterAuth(db, configService),
        mcpResource: getMcpResource(configService.get('BETTER_AUTH_URL')),
      }),
    },
    { provide: TokenValidator, useClass: BetterAuthTokenValidator },
    { provide: UserUpdater, useClass: BetterAuthUserUpdater },
    { provide: McpAuthenticator, useClass: BetterAuthMcpAuthenticator },
  ],
  exports: [BetterAuthInstance, TokenValidator, UserUpdater, McpAuthenticator],
})
export class BetterAuthModule {}
