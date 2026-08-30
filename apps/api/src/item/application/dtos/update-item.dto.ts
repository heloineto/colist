import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateItemSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(200).optional(),
    amount: z.int().min(0).max(1_000_000).optional(),
    categoryId: z.int().positive().nullish(),
    details: z.string().trim().max(2000).nullish(),
    checked: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');

export class UpdateItemDto extends createZodDto(UpdateItemSchema) {}
