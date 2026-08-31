import { Injectable } from '@nestjs/common';
import type { CreateErrorReportDto } from '@/report/application/dtos/create-error-report.dto';
import { ReportRepository } from '@/report/application/ports/report.repository';

@Injectable()
export class CreateErrorReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(userId: string | null, dto: CreateErrorReportDto): Promise<void> {
    return this.reportRepository.insertError(userId, dto);
  }
}
