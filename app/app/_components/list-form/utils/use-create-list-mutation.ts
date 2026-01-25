import { useTranslation } from '@information-systems/translations';
import { showNotification } from '@mantine/notifications';
import { useUpsertItem } from '@supabase-cache-helpers/postgrest-react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { LISTS_TABLE } from '@/utils/queries/lists';
import type { List } from '@/utils/queries/lists';
import { supabase } from '@/utils/supabase/create-browser-client';

export function useCreateListMutation({
  onSuccess,
  ...options
}: UseMutationOptions<List[] | null, Error, { name: string }>) {
  const { t } = useTranslation();
  const upsertItem = useUpsertItem<List>({
    primaryKeys: ['id'],
    table: LISTS_TABLE,
    schema: 'public',
    revalidateTables: [
      {
        table: LISTS_TABLE,
        schema: 'public',
      },
    ],
  });

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data } = await supabase
        .rpc('createList', { name })
        .throwOnError();
      return data;
    },
    onSuccess: (data, variables, context) => {
      if (!data || !data[0]) {
        showNotification({
          message: t({
            pt: 'Erro inesperado',
            en: 'Unexpected error',
            es: 'Error inesperado',
          }),
          color: 'red',
        });
        return;
      }
      upsertItem(data[0]);
      onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
