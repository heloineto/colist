import { Module } from '@nestjs/common';
import { ReportRepository } from '@/report/application/ports/report.repository';
import { DrizzleReportRepository } from '@/report/infrastructure/persistence/drizzle/repositories/drizzle-report.repository';

@Module({
  providers: [{ provide: ReportRepository, useClass: DrizzleReportRepository }],
  exports: [ReportRepository],
})
export class ReportInfrastructureModule {}
