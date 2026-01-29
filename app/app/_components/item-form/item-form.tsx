import { useTranslation } from '@/deprecated/packages/translations';
import { Drawer } from '@mantine/core';
import { useRef } from 'react';
import { useUpsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { showNotification } from '@mantine/notifications';
import { useWatch } from 'react-hook-form';
import { Textarea, TextInput } from '@/deprecated/packages/mantine-hook-form';
import { AmountButton } from './components/amount-button';
import { CategoryButton } from './components/category-button';
import { SubmitItemButton } from './components/submit-item-button';
import { DeleteItemButton } from './components/delete-item-button';
import { DetailsButton } from './components/details-button';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { ITEMS_COLUMNS, ITEMS_TABLE } from '@/deprecated/utils/queries/items';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import { useListContext } from '@/app/app/_utils/list-context';

export function ItemForm() {
  const { t } = useTranslation();
  const itemForm = useItemForm();
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const { listId } = useListContext();

  const detailsOpened = useWatch({
    control: itemForm.control,
    name: 'detailsOpened',
  });

  const mutation = useUpsertMutation(
    supabase.from(ITEMS_TABLE),
    ['id'],
    ITEMS_COLUMNS,
    { onSuccess: () => itemForm.disclosure.close({ confirmation: false }) }
  );

  return (
    <Drawer
      opened={itemForm.disclosure.opened}
      onClose={itemForm.disclosure.close}
      position="bottom"
      withCloseButton={false}
      classNames={{ content: '!rounded-t-lg !h-fit', body: '!pt-xs' }}
      transitionProps={{
        onExit: () => {
          itemForm.reset(itemForm.initialValues);
        },
      }}
    >
      <form
        onSubmit={itemForm.handleSubmit(
          (values) => mutation.mutateAsync([itemForm.toDatabase(values)]),
          (error) => console.error(error)
        )}
      >
        <TextInput
          classNames={{ input: '!h-9 !min-h-9' }}
          variant="unstyled"
          placeholder={t({
            pt: 'Novo item',
            en: 'New item',
            es: 'Nuevo item',
          })}
          size="lg"
          name="name"
          control={itemForm.control}
          autoComplete="off"
          data-autofocus
          type="search"
        />
        <Textarea
          classNames={{
            root: detailsOpened ? '-mt-2' : 'hidden',
            input: 'dark:!text-dark-1 !text-gray-8',
          }}
          ref={detailsRef}
          variant="unstyled"
          autosize
          placeholder={t({
            pt: 'Adicionar detalhes',
            en: 'Add details',
            es: 'Agregar detalles',
          })}
          control={itemForm.control}
          name="details"
        />
        <div className="flex justify-between">
          <div className="flex gap-1">
            <DetailsButton
              onClick={() => {
                setTimeout(() => detailsRef.current?.focus(), 0);
              }}
            />
            <AmountButton />
            <CategoryButton />
          </div>
          <div className="gap-xs flex">
            <DeleteItemButton />
            <SubmitItemButton
              onClick={() => {
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
                itemForm.setValue('listId', listId);
              }}
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
}
