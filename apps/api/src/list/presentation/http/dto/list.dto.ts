import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ListSchema } from '@/list/domain/list';
import { MemberSchema } from '@/list/domain/membership';

export class ListDto extends createZodDto(ListSchema) {}
export class ListsDto extends createZodDto(z.array(ListSchema)) {}
export class MemberDto extends createZodDto(MemberSchema) {}
export class MembersDto extends createZodDto(z.array(MemberSchema)) {}
