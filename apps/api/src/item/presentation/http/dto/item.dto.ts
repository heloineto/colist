import { createDto } from '@/common/application/dtos/zod-dto';
import { z } from 'zod';
import { ItemSchema } from '@/item/domain/item';

export class ItemDto extends createDto(ItemSchema) {}
export class ItemsDto extends createDto(z.array(ItemSchema)) {}
