import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const FindItemsSchema = z.strictObject({
  search: z.string().trim().min(1).max(200).optional(),
  sort: z.enum(['name', 'updatedAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  checked: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export class FindItemsDto extends createDto(FindItemsSchema) {}
