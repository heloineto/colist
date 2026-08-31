import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';
import { ActivitySchema } from '@/activity/domain/activity';

export class ActivitiesDto extends createDto(z.array(ActivitySchema)) {}
