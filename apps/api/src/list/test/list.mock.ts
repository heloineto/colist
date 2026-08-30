import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { CreateListDto } from '@/list/application/dtos/create-list.dto';

export const createListDtoFactory = Factory.define<CreateListDto>(() => ({
  name: faker.commerce.department(),
}));
