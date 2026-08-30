import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ItemSchema } from '@/item/domain/item';

export class ItemDto extends createZodDto(ItemSchema) {}
export class ItemsDto extends createZodDto(z.array(ItemSchema)) {}
