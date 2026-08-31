import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '@/category/application/use-cases/delete-category.use-case';
import { FindCategoriesUseCase } from '@/category/application/use-cases/find-categories.use-case';
import { RenameCategoryUseCase } from '@/category/application/use-cases/rename-category.use-case';
import { CategoryInfrastructureModule } from '@/category/infrastructure/category-infrastructure.module';
import { CategoriesController } from '@/category/presentation/http/categories.controller';

@Module({
  imports: [CategoryInfrastructureModule],
  controllers: [CategoriesController],
  providers: [
    FindCategoriesUseCase,
    CreateCategoryUseCase,
    RenameCategoryUseCase,
    DeleteCategoryUseCase,
  ],
})
export class CategoryModule {}
