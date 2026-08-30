import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import type { CreateErrorReportDto } from '@/report/application/dtos/create-error-report.dto';
import type { CreateFeedbackDto } from '@/report/application/dtos/create-feedback.dto';
import { ReportRepository } from '@/report/application/ports/report.repository';
import {
  errors,
  feedbacks,
} from '@/report/infrastructure/persistence/drizzle/report.schema';

@Injectable()
export class DrizzleReportRepository implements ReportRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  async insertError(
    userId: string | null,
    dto: CreateErrorReportDto
  ): Promise<void> {
    await this.db.insert(errors).values({
      userId,
      message: dto.message ?? null,
      error: dto.error ?? null,
      allowCommunication: dto.allowCommunication,
      files: dto.files,
    });
  }

  async insertFeedback(userId: string, dto: CreateFeedbackDto): Promise<void> {
    await this.db.insert(feedbacks).values({
      userId,
      message: dto.message,
      rating: dto.rating,
      files: dto.files,
    });
  }
}
