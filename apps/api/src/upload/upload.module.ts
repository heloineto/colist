import { Module } from '@nestjs/common';
import { PresignUploadUseCase } from '@/upload/application/use-cases/presign-upload.use-case';
import { S3Module } from '@/upload/infrastructure/s3/s3.module';
import { UploadsController } from '@/upload/presentation/http/uploads.controller';

@Module({
  imports: [S3Module],
  controllers: [UploadsController],
  providers: [PresignUploadUseCase],
})
export class UploadModule {}
