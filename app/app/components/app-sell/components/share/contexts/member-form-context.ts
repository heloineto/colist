import { createFormContext } from '@/deprecated/packages/mantine';
import { z } from 'zod';

export const memberDefaultValues = {
  email: '',
};

export type MemberFieldValues = typeof memberDefaultValues;

export const [useMemberFormProvider, useMemberForm, MemberFormProvider] =
  createFormContext({
    initialValues: memberDefaultValues,
    getSchema: (t) => {
      return z.object({
        email: z.email({
          error: t({
            pt: 'Por favor, forneça um e-mail válido',
            en: 'Please provide a valid e-mail',
            es: 'Por favor, proporcione un e-mail válido',
          }),
        }),
      });
    },
  });
