import { z } from 'zod';

export const ActiveUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  image: z.string().nullable(),
});

export type ActiveUserType = z.infer<typeof ActiveUserSchema>;
