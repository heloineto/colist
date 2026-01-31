import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { z } from 'zod';

export function useResetPasswordSchema() {
  return useMemo(() => {
    const schema = z.object({
      email: z.email({
        error: 'E-mail inválido',
      }),
    });

    const resolver = zodResolver(schema);

    return { schema, resolver };
  }, []);
}

export type ValidResetPasswordFieldValues = z.infer<
  ReturnType<typeof useResetPasswordSchema>['schema']
>;
