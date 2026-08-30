import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';
import { ActivitySchema } from '@/activity/domain/activity';

export const FindActivitiesQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().positive().optional(),
});

export class FindActivitiesQueryDto extends createDto(
  FindActivitiesQuerySchema
) {}

export class ActivitiesDto extends createDto(z.array(ActivitySchema)) {}
