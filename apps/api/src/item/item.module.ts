import { Global, Module } from '@nestjs/common';
import { CreateItemUseCase } from '@/item/application/use-cases/create-item.use-case';
import { DeleteItemUseCase } from '@/item/application/use-cases/delete-item.use-case';
import { FindItemsUseCase } from '@/item/application/use-cases/find-items.use-case';
import { UpdateItemUseCase } from '@/item/application/use-cases/update-item.use-case';
import { ItemInfrastructureModule } from '@/item/infrastructure/item-infrastructure.module';
import { ItemsController } from '@/item/presentation/http/items.controller';

// Global: exports are used by the MCP context.
@Global()
@Module({
  imports: [ItemInfrastructureModule],
  controllers: [ItemsController],
  providers: [
    FindItemsUseCase,
    CreateItemUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
  ],
  exports: [
    FindItemsUseCase,
    CreateItemUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
  ],
})
export class ItemModule {}
