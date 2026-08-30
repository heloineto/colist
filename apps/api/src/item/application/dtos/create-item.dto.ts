import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateItemSchema = z.strictObject({
  /** Client-generated, makes offline retries idempotent. */
  clientId: z.uuid().optional(),
  name: z.string().trim().min(1).max(200),
  amount: z.int().min(0).max(1_000_000).default(1),
  categoryId: z.int().positive().nullable().default(null),
  details: z.string().trim().max(2000).nullable().default(null),
});

export class CreateItemDto extends createZodDto(CreateItemSchema) {}
