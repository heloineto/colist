import { Module } from '@nestjs/common';
import { ItemRepository } from '@/item/application/ports/item.repository';
import { DrizzleItemRepository } from '@/item/infrastructure/persistence/drizzle/repositories/drizzle-item.repository';

@Module({
  providers: [{ provide: ItemRepository, useClass: DrizzleItemRepository }],
  exports: [ItemRepository],
})
export class ItemInfrastructureModule {}
