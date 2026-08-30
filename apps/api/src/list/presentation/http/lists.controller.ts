import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { CreateListDto } from '@/list/application/dtos/create-list.dto';
import { CreateListUseCase } from '@/list/application/use-cases/create-list.use-case';
import { DeleteListUseCase } from '@/list/application/use-cases/delete-list.use-case';
import { FindListUseCase } from '@/list/application/use-cases/find-list.use-case';
import { FindListsUseCase } from '@/list/application/use-cases/find-lists.use-case';
import { LeaveListUseCase } from '@/list/application/use-cases/leave-list.use-case';
import { RenameListUseCase } from '@/list/application/use-cases/rename-list.use-case';
import type { Membership } from '@/list/domain/membership';
import {
  ActiveMembership,
  ListId,
} from '@/list/presentation/http/decorators/list-id.decorator';
import { ListRole } from '@/list/presentation/http/decorators/list-role.decorator';
import { ListDto, ListsDto } from '@/list/presentation/http/dto/list.dto';
import { MembershipGuard } from '@/list/presentation/http/guards/membership.guard';

@ApiCookieAuth()
@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(
    private readonly findLists: FindListsUseCase,
    private readonly findList: FindListUseCase,
    private readonly createList: CreateListUseCase,
    private readonly renameList: RenameListUseCase,
    private readonly deleteList: DeleteListUseCase,
    private readonly leaveList: LeaveListUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'My lists', operationId: 'lists' })
  @ZodResponse({ status: 200, type: ListsDto })
  find(@ActiveUser() user: ActiveUserType) {
    return this.findLists.execute(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a list', operationId: 'listsCreate' })
  @ZodResponse({ status: 201, type: ListDto })
  create(@ActiveUser() user: ActiveUserType, @Body() dto: CreateListDto) {
    return this.createList.execute(user.id, dto);
  }

  @ApiParam({ name: 'listId', type: Number })
  @Get(':listId')
  @UseGuards(MembershipGuard)
  @ApiOperation({ summary: 'One list', operationId: 'listsFindOne' })
  @ZodResponse({ status: 200, type: ListDto })
  findOne(@ActiveUser() user: ActiveUserType, @ListId() listId: number) {
    return this.findList.execute(user.id, listId);
  }

  @ApiParam({ name: 'listId', type: Number })
  @Patch(':listId')
  @UseGuards(MembershipGuard)
  @ApiOperation({ summary: 'Rename a list', operationId: 'listsRename' })
  @ZodResponse({ status: 200, type: ListDto })
  rename(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Body() dto: CreateListDto
  ) {
    return this.renameList.execute(user, listId, dto);
  }

  @ApiParam({ name: 'listId', type: Number })
  @Delete(':listId')
  @ListRole('owner')
  @UseGuards(MembershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a list (owner)',
    operationId: 'listsDelete',
  })
  @ApiResponse({ status: 204 })
  async remove(@ListId() listId: number) {
    await this.deleteList.execute(listId);
  }

  @ApiParam({ name: 'listId', type: Number })
  @Post(':listId/leave')
  @UseGuards(MembershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Leave a list',
    description:
      'An owner leaving promotes the longest-standing member; the last member leaving deletes the list.',
    operationId: 'listsLeave',
  })
  @ApiResponse({ status: 204 })
  async leave(
    @ActiveUser() user: ActiveUserType,
    @ActiveMembership() membership: Membership
  ) {
    await this.leaveList.execute(user, membership);
  }
}
