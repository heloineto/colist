import { Module } from '@nestjs/common';
import { ConnectedAppRepository } from '@/iam/application/ports/connected-app.repository';
import { UserRepository } from '@/iam/application/ports/user.repository';
import { DrizzleConnectedAppRepository } from '@/iam/infrastructure/persistence/drizzle/repositories/drizzle-connected-app.repository';
import { DrizzleUserRepository } from '@/iam/infrastructure/persistence/drizzle/repositories/drizzle-user.repository';

@Module({
  providers: [
    { provide: UserRepository, useClass: DrizzleUserRepository },
    {
      provide: ConnectedAppRepository,
      useClass: DrizzleConnectedAppRepository,
    },
  ],
  exports: [UserRepository, ConnectedAppRepository],
})
export class DrizzlePersistenceModule {}
