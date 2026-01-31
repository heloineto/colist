import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useTranslation } from '@/deprecated/packages/translations';
import { getStrongPasswordSchema } from '../../password-strength';
import { useAuthFormContext } from '../../../../../contexts/auth-form-context';

export function useSignUpSchema() {
  const { t } = useTranslation();
  const { signUpFields } = useAuthFormContext();

  return useMemo(() => {
    const schema = z
      .object({
        email: z.email({
          error: t({
            pt: 'E-mail inválido',
            en: 'Invalid e-mail',
            es: 'Correo electrónico inválido',
          }),
        }),
        password: getStrongPasswordSchema(t),
        confirm: z.string(),
        name: z.string().optional(),
      })
      .refine(
        (data) => {
          if (!signUpFields?.confirmPassword) return true;
          return data.password === data.confirm;
        },
        {
          error: t({
            pt: 'As senhas não são iguais',
            en: 'Passwords do not match',
            es: 'Las contraseñas no coinciden',
          }),
          path: ['confirm'],
        }
      );

    const resolver = zodResolver(schema);

    return { schema, resolver };
  }, [signUpFields?.confirmPassword, t]);
}

export type ValidSignUpFieldValues = z.infer<
  ReturnType<typeof useSignUpSchema>['schema']
>;
