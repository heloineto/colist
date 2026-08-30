import { createDto } from '@/common/application/dtos/zod-dto';
import { PresignedUploadSchema } from '@/upload/application/dtos/presign-upload.dto';

export class PresignedUploadDto extends createDto(PresignedUploadSchema) {}
