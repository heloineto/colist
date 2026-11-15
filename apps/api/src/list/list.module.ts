import { Global, Module } from '@nestjs/common';
import { AddMembershipUseCase } from '@/list/application/use-cases/add-membership.use-case';
import { AuthorizeMembershipUseCase } from '@/list/application/use-cases/authorize-membership.use-case';
import { CreateListUseCase } from '@/list/application/use-cases/create-list.use-case';
import { DeleteListUseCase } from '@/list/application/use-cases/delete-list.use-case';
import { FindListUseCase } from '@/list/application/use-cases/find-list.use-case';
import { FindListsUseCase } from '@/list/application/use-cases/find-lists.use-case';
import { FindMembershipsUseCase } from '@/list/application/use-cases/find-memberships.use-case';
import { LeaveListUseCase } from '@/list/application/use-cases/leave-list.use-case';
import { RemoveMembershipUseCase } from '@/list/application/use-cases/remove-membership.use-case';
import { RenameListUseCase } from '@/list/application/use-cases/rename-list.use-case';
import { ListInfrastructureModule } from '@/list/infrastructure/list-infrastructure.module';
import { ListsController } from '@/list/presentation/http/lists.controller';
import { MembershipsController } from '@/list/presentation/http/memberships.controller';

// Global: exports are used by other contexts (MembershipGuard).
@Global()
@Module({
  imports: [ListInfrastructureModule],
  controllers: [ListsController, MembershipsController],
  providers: [
    AuthorizeMembershipUseCase,
    FindListsUseCase,
    FindListUseCase,
    CreateListUseCase,
    RenameListUseCase,
    DeleteListUseCase,
    LeaveListUseCase,
    FindMembershipsUseCase,
    AddMembershipUseCase,
    RemoveMembershipUseCase,
  ],
  exports: [AuthorizeMembershipUseCase],
})
export class ListModule {}
