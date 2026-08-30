import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { CreateItemDto } from '@/item/application/dtos/create-item.dto';

export const createItemDtoFactory = Factory.define<CreateItemDto>(() => ({
  name: faker.commerce.product(),
  amount: faker.number.int({ min: 1, max: 5 }),
  categoryId: null,
  details: null,
}));
