import { useTranslation } from '@information-systems/translations';
import { Button } from '@mantine/core';
import { useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { useWatch } from 'react-hook-form';
import { openDeleteModal } from '@information-systems/mantine';
import { ITEMS_COLUMNS, ITEMS_TABLE } from '@/utils/queries/items';
import { supabase } from '@/utils/supabase/create-browser-client';
import { useItemForm } from '@/app/app/_utils/item-form-context';

export function DeleteItemButton() {
  const form = useItemForm();
  const id = useWatch({ control: form.control, name: 'id' });
  const { t } = useTranslation();

  const mutation = useDeleteMutation(
    supabase.from(ITEMS_TABLE),
    ['id'],
    ITEMS_COLUMNS,
    { onSuccess: () => form.disclosure.close({ confirmation: false }) }
  );

  if (!id) return null;

  return (
    <Button
      color="red"
      variant="light"
      onClick={() => {
        const name = form.getValues('name');

        openDeleteModal({
          label: {
            singular: t({
              pt: `item "${name}"`,
              en: `item "${name}"`,
              es: `item "${name}"`,
            }),
          },
          onConfirm: () => mutation.mutate({ id }),
        });
      }}
    >
      {t({
        pt: 'Remover',
        en: 'Remove',
        es: 'Eliminar',
      })}
    </Button>
  );
}
