import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { CreateCategoryDto } from '@/category/application/dtos/create-category.dto';
import { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '@/category/application/use-cases/delete-category.use-case';
import { FindCategoriesUseCase } from '@/category/application/use-cases/find-categories.use-case';
import { RenameCategoryUseCase } from '@/category/application/use-cases/rename-category.use-case';
import {
  CategoriesDto,
  CategoryDto,
} from '@/category/presentation/http/dto/category.dto';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { ListId } from '@/list/presentation/http/decorators/list-id.decorator';
import { MembershipGuard } from '@/list/presentation/http/guards/membership.guard';

@ApiCookieAuth()
@ApiTags('Categories')
@UseGuards(MembershipGuard)
@ApiParam({ name: 'listId', type: Number })
@Controller('lists/:listId/categories')
export class CategoriesController {
  constructor(
    private readonly findCategories: FindCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly renameCategory: RenameCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Categories of a list', operationId: 'categories' })
  @ZodResponse({ status: 200, type: CategoriesDto })
  find(@ListId() listId: number) {
    return this.findCategories.execute(listId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a category',
    operationId: 'categoriesCreate',
  })
  @ZodResponse({ status: 201, type: CategoryDto })
  create(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Body() dto: CreateCategoryDto
  ) {
    return this.createCategory.execute(user, listId, dto);
  }

  @Patch(':categoryId')
  @ApiOperation({
    summary: 'Rename a category',
    operationId: 'categoriesRename',
  })
  @ZodResponse({ status: 200, type: CategoryDto })
  rename(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: CreateCategoryDto
  ) {
    return this.renameCategory.execute(user, listId, categoryId, dto);
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Items keep existing without a category. Already-deleted → 204.',
    operationId: 'categoriesDelete',
  })
  @ApiResponse({ status: 204 })
  async remove(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ) {
    await this.deleteCategory.execute(user, listId, categoryId);
  }
}
