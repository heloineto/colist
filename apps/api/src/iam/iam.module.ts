import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DisconnectAppUseCase } from '@/iam/application/use-cases/disconnect-app.use-case';
import { FindUserUseCase } from '@/iam/application/use-cases/find-user.use-case';
import { LookupUserUseCase } from '@/iam/application/use-cases/lookup-user.use-case';
import { IamInfrastructureModule } from '@/iam/infrastructure/iam-infrastructure.module';
import { ConnectedAppsController } from '@/iam/presentation/http/connected-apps.controller';
import { SessionGuard } from '@/iam/presentation/http/guards/session.guard';
import { MeController } from '@/iam/presentation/http/me.controller';
import { UsersController } from '@/iam/presentation/http/users.controller';

// Global: exports are used by the MCP context.
@Global()
@Module({
  imports: [IamInfrastructureModule],
  controllers: [MeController, UsersController, ConnectedAppsController],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    LookupUserUseCase,
    DisconnectAppUseCase,
    FindUserUseCase,
  ],
  exports: [IamInfrastructureModule, FindUserUseCase],
})
export class IamModule {}
