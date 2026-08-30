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
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { CreateItemDto } from '@/item/application/dtos/create-item.dto';
import { FindItemsDto } from '@/item/application/dtos/find-items.dto';
import { UpdateItemDto } from '@/item/application/dtos/update-item.dto';
import { CreateItemUseCase } from '@/item/application/use-cases/create-item.use-case';
import { DeleteItemUseCase } from '@/item/application/use-cases/delete-item.use-case';
import { FindItemsUseCase } from '@/item/application/use-cases/find-items.use-case';
import { UpdateItemUseCase } from '@/item/application/use-cases/update-item.use-case';
import { ItemDto, ItemsDto } from '@/item/presentation/http/dto/item.dto';
import { ListId } from '@/list/presentation/http/decorators/list-id.decorator';
import { MembershipGuard } from '@/list/presentation/http/guards/membership.guard';

@ApiCookieAuth()
@ApiTags('Items')
@UseGuards(MembershipGuard)
@ApiParam({ name: 'listId', type: Number })
@Controller('lists/:listId/items')
export class ItemsController {
  constructor(
    private readonly findItems: FindItemsUseCase,
    private readonly createItem: CreateItemUseCase,
    private readonly updateItem: UpdateItemUseCase,
    private readonly deleteItem: DeleteItemUseCase
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Items of a list',
    description:
      'Accent-insensitive `search`; `sort` by name (ICU pt-BR) or updatedAt. Group by `categoryId` client-side.',
    operationId: 'items',
  })
  @ZodResponse({ status: 200, type: ItemsDto })
  find(@ListId() listId: number, @Query() query: FindItemsDto) {
    return this.findItems.execute(listId, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Add an item',
    description:
      'Send a `clientId` (uuid) to make retries idempotent: a repeat returns the existing item with 200.',
    operationId: 'itemsCreate',
  })
  @ZodResponse({ status: 201, type: ItemDto })
  @ApiResponse({
    status: 200,
    description: 'Already created (same clientId)',
    type: ItemDto,
  })
  async create(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Body() dto: CreateItemDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const { item, created } = await this.createItem.execute(user, listId, dto);
    response.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return item;
  }

  @Patch(':itemId')
  @ApiOperation({
    summary: 'Edit or check an item',
    description:
      'Checking bumps `updatedAt`. 404 when the item is gone — drop the queued op.',
    operationId: 'itemsUpdate',
  })
  @ZodResponse({ status: 200, type: ItemDto })
  update(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateItemDto
  ) {
    return this.updateItem.execute(user, listId, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an item',
    description: 'Already-deleted → 204.',
    operationId: 'itemsDelete',
  })
  @ApiResponse({ status: 204 })
  async remove(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Param('itemId', ParseIntPipe) itemId: number
  ) {
    await this.deleteItem.execute(user, listId, itemId);
  }
}
