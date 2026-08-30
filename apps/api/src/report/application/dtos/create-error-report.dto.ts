import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

/** Locked crash-capture shape; the client ships codes + stack, never rendered i18n text. */
export const CapturedErrorSchema = z.strictObject({
  code: z.string().max(100).optional(),
  name: z.string().max(200),
  message: z.string().max(5000),
  stack: z.string().max(20_000).optional(),
  route: z.string().max(500),
  userAgent: z.string().max(500),
  appVersion: z.string().max(64),
});

export const CreateErrorReportSchema = z
  .strictObject({
    message: z.string().trim().min(1).max(5000).optional(),
    error: CapturedErrorSchema.optional(),
    allowCommunication: z.boolean().default(false),
    files: z.array(z.string().min(1).max(512)).max(5).default([]),
  })
  .refine(
    (value) => value.message !== undefined || value.error !== undefined,
    'Send a message or a captured error'
  );

export class CreateErrorReportDto extends createDto(
  CreateErrorReportSchema
) {}
