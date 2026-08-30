import type { CreateErrorReportDto } from '@/report/application/dtos/create-error-report.dto';
import type { CreateFeedbackDto } from '@/report/application/dtos/create-feedback.dto';

/** Insert-only: psql is the admin UI. */
export abstract class ReportRepository {
  abstract insertError(
    userId: string | null,
    dto: CreateErrorReportDto
  ): Promise<void>;
  abstract insertFeedback(
    userId: string,
    dto: CreateFeedbackDto
  ): Promise<void>;
}
