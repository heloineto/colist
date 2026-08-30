import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const CreateCategorySchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
});

export class CreateCategoryDto extends createDto(CreateCategorySchema) {}
