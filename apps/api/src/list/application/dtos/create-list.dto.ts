import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateListSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
});

export class CreateListDto extends createZodDto(CreateListSchema) {}
