import { Module } from '@nestjs/common';
import { Presigner } from '@/upload/application/ports/presigner.port';
import { S3Presigner } from '@/upload/infrastructure/s3/s3-presigner';

@Module({
  providers: [{ provide: Presigner, useClass: S3Presigner }],
  exports: [Presigner],
})
export class S3Module {}
