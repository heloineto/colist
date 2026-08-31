import { Module } from '@nestjs/common';
import { CreateErrorReportUseCase } from '@/report/application/use-cases/create-error-report.use-case';
import { CreateFeedbackUseCase } from '@/report/application/use-cases/create-feedback.use-case';
import { ReportInfrastructureModule } from '@/report/infrastructure/report-infrastructure.module';
import { ErrorsController } from '@/report/presentation/http/errors.controller';
import { FeedbacksController } from '@/report/presentation/http/feedbacks.controller';

@Module({
  imports: [ReportInfrastructureModule],
  controllers: [ErrorsController, FeedbacksController],
  providers: [CreateErrorReportUseCase, CreateFeedbackUseCase],
})
export class ReportModule {}
