import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { CreateFeedbackDto } from '@/report/application/dtos/create-feedback.dto';
import { CreateFeedbackUseCase } from '@/report/application/use-cases/create-feedback.use-case';

@ApiCookieAuth()
@ApiTags('Reports')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly createFeedback: CreateFeedbackUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send feedback', operationId: 'feedbacksCreate' })
  @ApiResponse({ status: 201 })
  async create(
    @ActiveUser() user: ActiveUserType,
    @Body() dto: CreateFeedbackDto
  ) {
    await this.createFeedback.execute(user.id, dto);
  }
}
