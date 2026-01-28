import { useMemo } from 'react';
import { boolean, object, string, type z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@information-systems/translations';
import { getStrongPasswordSchema } from '../../password-strength';

export function useSignInSchema() {
  const { t } = useTranslation();

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
      remember: boolean(),
    });

    const resolver = zodResolver(schema);

    return { schema, resolver };
  }, [t]);
}

export type ValidSignInFieldValues = z.infer<
  ReturnType<typeof useSignInSchema>['schema']
>;
