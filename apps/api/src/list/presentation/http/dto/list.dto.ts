import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';
import { ListSchema } from '@/list/domain/list';
import { MemberSchema } from '@/list/domain/membership';

export class ListDto extends createDto(ListSchema) {}
export class ListsDto extends createDto(z.array(ListSchema)) {}
export class MemberDto extends createDto(MemberSchema) {}
export class MembersDto extends createDto(z.array(MemberSchema)) {}
