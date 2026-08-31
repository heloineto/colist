import { Module } from '@nestjs/common';
import { BetterAuthModule } from '@/iam/infrastructure/better-auth/better-auth.module';
import { DrizzlePersistenceModule } from '@/iam/infrastructure/persistence/drizzle/drizzle-persistence.module';

@Module({
  imports: [BetterAuthModule, DrizzlePersistenceModule],
  exports: [BetterAuthModule, DrizzlePersistenceModule],
})
export class IamInfrastructureModule {}
