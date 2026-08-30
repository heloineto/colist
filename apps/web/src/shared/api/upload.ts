import { uploadsPresign } from '@/shared/api/generated/uploads/uploads';
import type { PresignUploadDtoContentType, PresignUploadDtoKind } from '@/shared/api/generated/models';

/** Presigned PUT to S3; returns the stored key + public URL. Throws on a failed PUT. */
export async function uploadFile(kind: PresignUploadDtoKind, file: File) {
  const presigned = await uploadsPresign({ kind, contentType: file.type as PresignUploadDtoContentType });
  const response = await fetch(presigned.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return presigned;
}

export const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
