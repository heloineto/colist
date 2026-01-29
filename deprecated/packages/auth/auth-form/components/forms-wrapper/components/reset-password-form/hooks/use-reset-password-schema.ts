import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { object, string, type z } from 'zod';

export function useResetPasswordSchema() {
  return useMemo(() => {
    const schema = object({
      email: string().email({ message: 'E-mail inválido' }),
    });

    const resolver = zodResolver(schema);

    return { schema, resolver };
  }, []);
}

export type ValidResetPasswordFieldValues = z.infer<
  ReturnType<typeof useResetPasswordSchema>['schema']
>;
