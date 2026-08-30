import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMeSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(100).optional(),
    image: z.url().nullish(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');

export class UpdateMeDto extends createZodDto(UpdateMeSchema) {}
