import { useTranslation } from '@/deprecated/packages/translations';
import { Button } from '@mantine/core';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { showNotification } from '@mantine/notifications';
import type { Disclosure } from '@/deprecated/packages/mantine';
import { useListContext } from '@/app/app/_utils/list-context';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_TABLE,
} from '@/deprecated/utils/queries/categories';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { useItemForm } from '@/app/app/_utils/item-form-context';

interface Props {
  search: string;
  setSearch: (value: string) => void;
  disclosure: Disclosure;
}

export function CategoryCreateButton({ search, setSearch, disclosure }: Props) {
  const { t } = useTranslation();
  const { listId } = useListContext();
  const itemForm = useItemForm();
  const insertMutation = useInsertMutation(
    supabase.from(CATEGORIES_TABLE),
    ['id'],
    CATEGORIES_COLUMNS
  );

  return (
    <Button
      variant="transparent"
      size="compact-sm"
      h="1.75rem"
      px={0}
      fz={16}
      fw={400}
      bd="none"
      leftSection={
        <div className="bg-green-light flex size-5 items-center justify-center rounded-full">
          <Plus size="1rem" />
        </div>
      }
      classNames={{
        root: '!transform-none !-outline-offset-2',
        inner: '!justify-start',
      }}
      loading={insertMutation.isPending}
      onClick={async () => {
        if (!listId) {
          showNotification({
            message: t({
              pt: 'Nenhuma lista selecionada',
              en: 'No list selected',
              es: 'No se ha seleccionado ninguna lista',
            }),
            color: 'red',
          });
          return;
        }

        await insertMutation.mutateAsync([{ listId, name: search }], {
          onSuccess: (data) => {
            const id = (data?.[0] as { id: unknown }).id;
            if (typeof id === 'number') {
              itemForm.setValue('categoryId', id);
              disclosure.close();
            }
          },
        });
        setSearch('');
      }}
    >
      {t({ pt: 'Adicionar', en: 'Add', es: 'Añadir' })}
      {search ? ` "${search}"` : null}
    </Button>
  );
}
