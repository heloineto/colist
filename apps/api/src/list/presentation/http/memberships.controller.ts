import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { AddMembershipDto } from '@/list/application/dtos/add-membership.dto';
import { AddMembershipUseCase } from '@/list/application/use-cases/add-membership.use-case';
import { FindMembershipsUseCase } from '@/list/application/use-cases/find-memberships.use-case';
import { RemoveMembershipUseCase } from '@/list/application/use-cases/remove-membership.use-case';
import { ListId } from '@/list/presentation/http/decorators/list-id.decorator';
import { ListRole } from '@/list/presentation/http/decorators/list-role.decorator';
import { MemberDto, MembersDto } from '@/list/presentation/http/dto/list.dto';
import { MembershipGuard } from '@/list/presentation/http/guards/membership.guard';

@ApiCookieAuth()
@ApiTags('Memberships')
@UseGuards(MembershipGuard)
@Controller('lists/:listId/memberships')
export class MembershipsController {
  constructor(
    private readonly findMemberships: FindMembershipsUseCase,
    private readonly addMembership: AddMembershipUseCase,
    private readonly removeMembership: RemoveMembershipUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Members of a list', operationId: 'memberships' })
  @ZodResponse({ status: 200, type: MembersDto })
  find(@ListId() listId: number) {
    return this.findMemberships.execute(listId);
  }

  @Post()
  @ListRole('owner')
  @ApiOperation({
    summary: 'Add a member by user id (owner)',
    operationId: 'membershipsAdd',
  })
  @ZodResponse({ status: 201, type: MemberDto })
  add(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Body() dto: AddMembershipDto
  ) {
    return this.addMembership.execute(user, listId, dto);
  }

  @Delete(':userId')
  @ListRole('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a member (owner)',
    operationId: 'membershipsRemove',
  })
  @ApiResponse({ status: 204 })
  async remove(
    @ActiveUser() user: ActiveUserType,
    @ListId() listId: number,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    await this.removeMembership.execute(user, listId, userId);
  }
}
