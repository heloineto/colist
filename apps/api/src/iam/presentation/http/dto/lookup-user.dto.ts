import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LookupUserQuerySchema = z.strictObject({ email: z.email() });

export class LookupUserQueryDto extends createZodDto(LookupUserQuerySchema) {}

export const UserPreviewSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  image: z.string().nullable(),
});

export class UserPreviewDto extends createZodDto(UserPreviewSchema) {}
