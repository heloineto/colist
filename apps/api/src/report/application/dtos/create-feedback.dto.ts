import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateFeedbackSchema = z.strictObject({
  message: z.string().trim().min(1).max(5000),
  rating: z.int().min(1).max(5).nullable().default(null),
  files: z.array(z.string().min(1).max(512)).max(5).default([]),
});

export class CreateFeedbackDto extends createZodDto(CreateFeedbackSchema) {}
