import { useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/deprecated/packages/translations';
import { getStrongPasswordSchema } from '../../password-strength';

export function useSignInSchema() {
  const { t } = useTranslation();

  return useMemo(() => {
    const schema = z.object({
      email: z.email({
        error: t({
          pt: 'E-mail inválido',
          en: 'Invalid e-mail',
          es: 'Correo electrónico inválido',
        }),
      }),
      password: getStrongPasswordSchema(t),
      remember: z.boolean(),
    });

    const resolver = zodResolver(schema);

    return { schema, resolver };
  }, [t]);
}

export type ValidSignInFieldValues = z.infer<
  ReturnType<typeof useSignInSchema>['schema']
>;
