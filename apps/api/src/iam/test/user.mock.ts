import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export type SignUpDto = { name: string; email: string; password: string };

export const signUpDtoFactory = Factory.define<SignUpDto>(({ sequence }) => ({
  name: faker.person.fullName(),
  email:
    `${sequence}-${faker.string.alphanumeric(8)}@e2e.colist.test`.toLowerCase(),
  password: faker.internet.password({ length: 16 }),
}));
