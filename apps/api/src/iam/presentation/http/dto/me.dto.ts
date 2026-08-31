import { createDto } from '@/common/application/dtos/zod-dto';
import { ActiveUserSchema } from '@/iam/domain/active-user';

export class MeDto extends createDto(ActiveUserSchema) {}
