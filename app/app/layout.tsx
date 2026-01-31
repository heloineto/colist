import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import type { OptionsFieldValues } from './utils/options-form-context';
import { deserializeJSON } from '@/deprecated/hooks/use-cookie/utils/deserialize-json';

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {
  const listId = deserializeJSON((await cookies()).get('list-id')?.value) as
    | number
    | null
    | undefined;

  const options = deserializeJSON((await cookies()).get('options')?.value) as
    | OptionsFieldValues
    | null
    | undefined;

  return (
    <Providers listId={listId} options={options}>
      {children}
    </Providers>
  );
}
