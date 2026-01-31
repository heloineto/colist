import { createSafeContext } from '@mantine/core';
import {
  useQuery,
  useSubscription,
  type UseQuerySingleReturn,
} from '@supabase-cache-helpers/postgrest-react-query';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  LISTS_COLUMNS,
  LISTS_TABLE,
  type List,
} from '@/deprecated/utils/queries/lists';
import { useCookie } from '@/deprecated/hooks/use-cookie';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { useAuth } from '@/app/contexts/auth-context';

interface ListContext {
  listId: number | null;
  setListId: Dispatch<SetStateAction<number | null>>;
  listsQuery: UseQuerySingleReturn<List[]>;
}

export const [OriginalListProvider, useListContext] =
  createSafeContext<ListContext>(
    'ListProvider component was not found in the tree'
  );

export interface ListProviderProps {
  children: ReactNode;
  listId: number | null | undefined;
}
export function ListProvider({
  listId: defaultListId,
  children,
}: ListProviderProps) {
  const { profileQuery } = useAuth();

  const [listId, setListId] = useCookie({
    key: 'list-id',
    defaultValue: defaultListId,
    expires: 365,
  });

  const profileId = profileQuery.data?.id;

  const listsQuery = useQuery(
    supabase
      .from(LISTS_TABLE)
      .select(`${LISTS_COLUMNS},members(profileId)`)
      .eq('members.profileId', profileId as string)
      .order('name', { ascending: true }),

    { enabled: !!profileId }
  );

  useSubscription(
    supabase,
    LISTS_TABLE,
    {
      event: '*',
      table: LISTS_COLUMNS,
      schema: 'public',
    },
    ['id'],
    {
      callback: () => {
        listsQuery.refetch();
      },
    }
  );

  return (
    <OriginalListProvider value={{ listId, setListId, listsQuery }}>
      {children}
    </OriginalListProvider>
  );
}
