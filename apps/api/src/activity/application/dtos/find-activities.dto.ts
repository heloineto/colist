import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const FindActivitiesSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().positive().optional(),
});

export class FindActivitiesDto extends createDto(FindActivitiesSchema) {}
