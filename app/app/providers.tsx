'use client';

import { useEffect, type ReactNode } from 'react';
import cookies from 'js-cookie';
import { useWatch } from 'react-hook-form';
import { useSessionQuery, useUserQuery } from '@/deprecated/packages/mantine';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import type { OptionsFieldValues } from './_utils/options-form-context';
import {
  OptionsFormProvider,
  optionsInitialValues,
  useOptionsForm,
  useOptionsFormProvider,
} from './_utils/options-form-context';
import {
  ListFormProvider,
  useListFormProvider,
} from './_utils/list-form-context';
import {
  ItemFormProvider,
  useItemFormProvider,
} from './_utils/item-form-context';
import { ListProvider } from './_utils/list-context';
import { AuthProvider } from '@/app/contexts/auth-context';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import {
  PROFILES_COLUMNS,
  PROFILES_TABLE,
} from '@/deprecated/utils/queries/profiles';

interface Props {
  children: ReactNode;
  listId: number | null | undefined;
  options: OptionsFieldValues | null | undefined;
}

export function Providers({ children, listId, options }: Props) {
  const userQuery = useUserQuery(supabase);
  const sessionQuery = useSessionQuery(supabase);
  const profileQuery = useQuery(
    supabase
      .from(PROFILES_TABLE)
      .select(PROFILES_COLUMNS)
      .eq('id', userQuery.data?.id as string)
      .single(),
    { enabled: Boolean(userQuery.data?.id) }
  );

  const optionsForm = useOptionsFormProvider({
    initialValues: options ?? optionsInitialValues,
  });
  const listForm = useListFormProvider();
  const itemForm = useItemFormProvider();

  return (
    <AuthProvider
      sessionQuery={sessionQuery}
      userQuery={userQuery}
      profileQuery={profileQuery}
    >
      <OptionsFormProvider form={optionsForm}>
        <OptionsCookieUpdater />
        <ListFormProvider form={listForm}>
          <ItemFormProvider form={itemForm}>
            <ListProvider listId={listId}>{children}</ListProvider>
          </ItemFormProvider>
        </ListFormProvider>
      </OptionsFormProvider>
    </AuthProvider>
  );
}

function OptionsCookieUpdater() {
  const optionsForm = useOptionsForm();
  const values = useWatch({ control: optionsForm.control });

  useEffect(() => {
    cookies.set('options', JSON.stringify(values), { expires: 365 });
  }, [values]);

  return null;
}
