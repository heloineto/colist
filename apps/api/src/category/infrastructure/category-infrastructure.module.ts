import { Module } from '@nestjs/common';
import { CategoryRepository } from '@/category/application/ports/category.repository';
import { DrizzleCategoryRepository } from '@/category/infrastructure/persistence/drizzle/repositories/drizzle-category.repository';

@Module({
  providers: [
    { provide: CategoryRepository, useClass: DrizzleCategoryRepository },
  ],
  exports: [CategoryRepository],
})
export class CategoryInfrastructureModule {}
