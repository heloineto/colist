import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { CreateCategoryDto } from '@/category/application/dtos/create-category.dto';

export const createCategoryDtoFactory = Factory.define<CreateCategoryDto>(
  () => ({ name: faker.commerce.productAdjective() })
);
