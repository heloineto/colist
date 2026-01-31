'use client';

import { Button, Drawer, Modal } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { useMediaQuery } from '@mantine/hooks';
import { useWatch } from 'react-hook-form';
import { TextInput } from '@/deprecated/packages/mantine-hook-form';
import { useListForm } from '../../_utils/list-form-context';
import { useCreateListMutation } from './utils/use-create-list-mutation';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { LISTS_COLUMNS, LISTS_TABLE } from '@/deprecated/utils/queries/lists';

export function ListForm() {
  const { t } = useTranslation();
  const form = useListForm();
  const isDesktop = useMediaQuery('(min-width: 48em)');
  const id = useWatch({ control: form.control, name: 'id' });

  const title = id
    ? t({ pt: 'Editar lista', en: 'Edit list', es: 'Editar lista' })
    : t({ pt: 'Nova lista', en: 'New list', es: 'Nueva lista' });

  const updateMutation = useUpdateMutation(
    supabase.from(LISTS_TABLE),
    ['id'],
    LISTS_COLUMNS,
    { onSuccess: () => form.disclosure.close({ confirmation: false }) }
  );

  const createMutation = useCreateListMutation({
    onSuccess: () => form.disclosure.close({ confirmation: false }),
  });

  const content = (
    <form
      className="gap-md flex flex-col"
      onSubmit={form.handleSubmit(async (values) => {
        if (!values.id) {
          await createMutation.mutateAsync(values);
          return;
        }

        await updateMutation.mutateAsync(form.toDatabase(values));
      })}
    >
      <TextInput
        label={t({ pt: 'Nome', en: 'Name', es: 'Nombre' })}
        placeholder={t({ pt: 'Nome', en: 'Name', es: 'Nombre' })}
        name="name"
        control={form.control}
        autoComplete="off"
        data-autofocus
      />
      <div className="gap-xs flex justify-end">
        <Button variant="light" color="gray" onClick={form.disclosure.close}>
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button variant="light" type="submit">
          {id
            ? t({ pt: 'Salvar', en: 'Save', es: 'Guardar' })
            : t({ pt: 'Criar', en: 'Create', es: 'Crear' })}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Drawer
        title={title}
        opened={form.disclosure.opened}
        onClose={form.disclosure.close}
        position="right"
        transitionProps={{
          duration: 200,
          onExited: () => form.reset(form.initialValues),
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      fullScreen
      title={title}
      opened={form.disclosure.opened}
      onClose={form.disclosure.close}
      transitionProps={{
        duration: 200,
        transition: 'fade-down',
        onExited: () => form.reset(form.initialValues),
      }}
    >
      {content}
    </Modal>
  );
}
