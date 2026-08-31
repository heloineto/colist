import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const LookupUserQuerySchema = z.strictObject({ email: z.email() });

export class LookupUserQueryDto extends createDto(LookupUserQuerySchema) {}

export const UserPreviewSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  image: z.string().nullable(),
});

export class UserPreviewDto extends createDto(UserPreviewSchema) {}
