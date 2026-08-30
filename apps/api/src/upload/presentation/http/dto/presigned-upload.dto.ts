import { createZodDto } from 'nestjs-zod';
import { PresignedUploadSchema } from '@/upload/application/dtos/presign-upload.dto';

export class PresignedUploadDto extends createZodDto(PresignedUploadSchema) {}
