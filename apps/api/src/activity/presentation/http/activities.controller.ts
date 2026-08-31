import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { FindActivitiesDto } from '@/activity/application/dtos/find-activities.dto';
import { FindActivitiesUseCase } from '@/activity/application/use-cases/find-activities.use-case';
import { ActivitiesDto } from '@/activity/presentation/http/dto/activity.dto';
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
  find(@ListId() listId: number, @Query() query: FindActivitiesDto) {
    return this.findActivities.execute(listId, query);
  }
}
