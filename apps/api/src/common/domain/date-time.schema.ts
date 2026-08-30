import { z } from 'zod';

/** z.date() for domain rows; nestjs-zod docs generation can't represent Date, so tell it "ISO string". */
export const DateTimeSchema = z.date();
DateTimeSchema._zod.toJSONSchema = () => ({
  type: 'string',
  format: 'date-time',
});
