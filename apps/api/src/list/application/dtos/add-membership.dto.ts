import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddMembershipSchema = z.strictObject({ userId: z.uuid() });

export class AddMembershipDto extends createZodDto(AddMembershipSchema) {}
