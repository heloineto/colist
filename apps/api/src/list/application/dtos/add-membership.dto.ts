import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';

export const AddMembershipSchema = z.strictObject({ userId: z.uuid() });

export class AddMembershipDto extends createDto(AddMembershipSchema) {}
