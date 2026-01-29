import { createFormContext } from '@/deprecated/packages/mantine';
import { object, string } from 'zod';

export const memberDefaultValues = {
  email: '',
};

export type MemberFieldValues = typeof memberDefaultValues;

export const [useMemberFormProvider, useMemberForm, MemberFormProvider] =
  createFormContext({
    initialValues: memberDefaultValues,
    getSchema: (t) => {
      return object({
        email: string().email({
          message: t({
            pt: 'Por favor, forneça um e-mail válido',
            en: 'Please provide a valid e-mail',
            es: 'Por favor, proporcione un e-mail válido',
          }),
        }),
      });
    },
  });
