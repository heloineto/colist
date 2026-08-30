import { Injectable } from '@nestjs/common';
import type { CreateFeedbackDto } from '@/report/application/dtos/create-feedback.dto';
import { ReportRepository } from '@/report/application/ports/report.repository';

@Injectable()
export class CreateFeedbackUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(userId: string, dto: CreateFeedbackDto): Promise<void> {
    return this.reportRepository.insertFeedback(userId, dto);
  }
}
