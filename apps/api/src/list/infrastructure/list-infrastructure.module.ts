import { Global, Module } from '@nestjs/common';
import { ListRepository } from '@/list/application/ports/list.repository';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import { DrizzleListRepository } from '@/list/infrastructure/persistence/drizzle/repositories/drizzle-list.repository';
import { DrizzleMembershipRepository } from '@/list/infrastructure/persistence/drizzle/repositories/drizzle-membership.repository';

@Global()
@Module({
  providers: [
    { provide: ListRepository, useClass: DrizzleListRepository },
    { provide: MembershipRepository, useClass: DrizzleMembershipRepository },
  ],
  exports: [ListRepository, MembershipRepository],
})
export class ListInfrastructureModule {}
