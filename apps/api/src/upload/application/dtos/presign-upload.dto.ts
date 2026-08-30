import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const UPLOAD_KINDS = ['avatar', 'attachment'] as const;

export const PresignUploadSchema = z.strictObject({
  kind: z.enum(UPLOAD_KINDS),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
});

export class PresignUploadDto extends createDto(PresignUploadSchema) {}

export const PresignedUploadSchema = z.strictObject({
  /** PUT the file here with the same Content-Type, within 5 minutes. */
  url: z.url(),
  /** Store this on the entity (avatar `image`, report `files`). */
  key: z.string(),
  /** Public URL — only meaningful for avatars. */
  publicUrl: z.url(),
});

export type PresignedUpload = z.infer<typeof PresignedUploadSchema>;
