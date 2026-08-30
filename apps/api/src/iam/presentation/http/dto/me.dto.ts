import { createZodDto } from 'nestjs-zod';
import { ActiveUserSchema } from '@/iam/domain/active-user';

export class MeDto extends createZodDto(ActiveUserSchema) {}
