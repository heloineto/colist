import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ActivitySchema } from '@/activity/domain/activity';

export const FindActivitiesQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().positive().optional(),
});

export class FindActivitiesQueryDto extends createZodDto(
  FindActivitiesQuerySchema
) {}

export class ActivitiesDto extends createZodDto(z.array(ActivitySchema)) {}
