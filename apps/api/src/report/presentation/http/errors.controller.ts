import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { AuthType } from '@/iam/domain/auth-type';
import { OptionalActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { Auth } from '@/iam/presentation/http/decorators/auth.decorator';
import { CreateErrorReportDto } from '@/report/application/dtos/create-error-report.dto';
import { CreateErrorReportUseCase } from '@/report/application/use-cases/create-error-report.use-case';

@ApiTags('Reports')
@Auth(AuthType.None)
@UseGuards(ThrottlerGuard)
@Controller('errors')
export class ErrorsController {
  constructor(private readonly createErrorReport: CreateErrorReportUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Report an error',
    description:
      'Public (pre-login crashes matter), rate-limited per IP (10/min). Attributed to the session when a cookie is present.',
    operationId: 'errorsCreate',
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 429, description: 'Too many reports' })
  async create(
    @OptionalActiveUser() user: ActiveUserType | null,
    @Body() dto: CreateErrorReportDto
  ) {
    await this.createErrorReport.execute(user?.id ?? null, dto);
  }
}
