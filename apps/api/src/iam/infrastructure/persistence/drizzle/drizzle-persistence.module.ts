import { Module } from '@nestjs/common';
import { UserRepository } from '@/iam/application/ports/user.repository';
import { DrizzleUserRepository } from '@/iam/infrastructure/persistence/drizzle/repositories/drizzle-user.repository';

@Module({
  providers: [{ provide: UserRepository, useClass: DrizzleUserRepository }],
  exports: [UserRepository],
})
export class DrizzlePersistenceModule {}
