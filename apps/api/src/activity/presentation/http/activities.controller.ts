import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { FindActivitiesUseCase } from '@/activity/application/use-cases/find-activities.use-case';
import {
  ActivitiesDto,
  FindActivitiesQueryDto,
} from '@/activity/presentation/http/dto/find-activities.dto';
import { ListId } from '@/list/presentation/http/decorators/list-id.decorator';
import { MembershipGuard } from '@/list/presentation/http/guards/membership.guard';

@ApiCookieAuth()
@ApiTags('Activities')
@UseGuards(MembershipGuard)
@ApiParam({ name: 'listId', type: Number })
@Controller('lists/:listId/activities')
export class ActivitiesController {
  constructor(private readonly findActivities: FindActivitiesUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'List history',
    description: 'Newest first; pass `before=<id>` to page.',
    operationId: 'activities',
  })
  @ZodResponse({ status: 200, type: ActivitiesDto })
  find(@ListId() listId: number, @Query() query: FindActivitiesQueryDto) {
    return this.findActivities.execute(listId, query);
  }
}
