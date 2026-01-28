import { object, string, type z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useTranslation } from '@information-systems/translations';
import { getStrongPasswordSchema } from '../../password-strength';
import { useAuthFormContext } from '../../../../../contexts/auth-form-context';

export function useSignUpSchema() {
  const { t } = useTranslation();
  const { signUpFields } = useAuthFormContext();

  return useMemo(() => {
    const schema = object({
      email: string().email(
        t({
          pt: 'E-mail inválido',
          en: 'Invalid e-mail',
          es: 'Correo electrónico inválido',
        })
      ),
      password: getStrongPasswordSchema(t),
      confirm: string(),
      name: string().optional(),
    }).refine(
      (data) => {
        if (!signUpFields?.confirmPassword) return true;
        return data.password === data.confirm;
      },
      {
        message: t({
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
