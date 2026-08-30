import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { CreateErrorReportDto } from '@/report/application/dtos/create-error-report.dto';
import type { CreateFeedbackDto } from '@/report/application/dtos/create-feedback.dto';

export const createFeedbackDtoFactory = Factory.define<CreateFeedbackDto>(
  () => ({
    message: faker.lorem.sentence(),
    rating: faker.number.int({ min: 1, max: 5 }),
    files: [],
  })
);

export const createErrorReportDtoFactory = Factory.define<CreateErrorReportDto>(
  () => ({
    error: {
      code: 'E_TEST',
      name: 'TypeError',
      message: faker.lorem.sentence(),
      stack: 'TypeError: boom\n    at test',
      route: '/lists',
      userAgent: 'vitest',
      appVersion: 'abc1234',
    },
    allowCommunication: false,
    files: [],
  })
);
