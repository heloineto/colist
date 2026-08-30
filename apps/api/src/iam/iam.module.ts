import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LookupUserUseCase } from '@/iam/application/use-cases/lookup-user.use-case';
import { IamInfrastructureModule } from '@/iam/infrastructure/iam-infrastructure.module';
import { AuthGuard } from '@/iam/presentation/http/guards/auth.guard';
import { OptionalSessionGuard } from '@/iam/presentation/http/guards/optional-session.guard';
import { SessionGuard } from '@/iam/presentation/http/guards/session.guard';
import { MeController } from '@/iam/presentation/http/me.controller';
import { UsersController } from '@/iam/presentation/http/users.controller';

@Module({
  imports: [IamInfrastructureModule],
  controllers: [MeController, UsersController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    SessionGuard,
    OptionalSessionGuard,
    LookupUserUseCase,
  ],
  exports: [IamInfrastructureModule],
})
export class IamModule {}
