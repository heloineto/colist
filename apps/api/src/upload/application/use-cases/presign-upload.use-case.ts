import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  PresignUploadDto,
  PresignedUpload,
} from '@/upload/application/dtos/presign-upload.dto';
import { Presigner } from '@/upload/application/ports/presigner.port';

const EXTENSION: Record<PresignUploadDto['contentType'], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const PREFIX: Record<PresignUploadDto['kind'], string> = {
  avatar: 'avatars',
  attachment: 'attachments',
};

@Injectable()
export class PresignUploadUseCase {
  constructor(private readonly presigner: Presigner) {}

  async execute(
    userId: string,
    dto: PresignUploadDto
  ): Promise<PresignedUpload> {
    const key = `${PREFIX[dto.kind]}/${userId}/${randomUUID()}.${EXTENSION[dto.contentType]}`;

    return {
      url: await this.presigner.presignPut(key, dto.contentType),
      key,
      publicUrl: this.presigner.publicUrl(key),
    };
  }
}
