import { Button, Drawer, Modal, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { invalidateLists } from '@/entities/list';
import { useListForm } from '@/features/lists/model/list-form-context';
import { useListsCreate, useListsRename } from '@/shared/api/generated/lists/lists';
import { useSelectedListId } from '@/shared/lib/preferences';
import { confirmDiscard } from '@/shared/ui/confirm';

export function ListForm() {
  const { t } = useTranslation();
  const { opened, list, close } = useListForm();
  const isDesktop = useMediaQuery('(min-width: 48em)');
  const [, setListId] = useSelectedListId();
  const form = useForm({
    initialValues: { name: '' },
    validate: { name: isNotEmpty(t('lists.form.nameRequired')) },
  });

  useEffect(() => {
    if (opened) form.setValues({ name: list?.name ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open only
  }, [opened, list]);

  const create = useListsCreate({
    mutation: {
      meta: { success: t('lists.created') },
      onSuccess: (created) => {
        invalidateLists();
        setListId(created.id);
        close();
      },
    },
  });
  const rename = useListsRename({
    mutation: {
      meta: { success: t('lists.renamed') },
      onSuccess: () => {
        invalidateLists();
        close();
      },
    },
  });

  const requestClose = () => {
    if (!form.isDirty()) return close();
    confirmDiscard(close);
  };

  const submit = form.onSubmit(({ name }) => {
    if (list) rename.mutate({ listId: list.id, data: { name } });
    else create.mutate({ data: { name } });
  });

  const body = (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <TextInput
        label={t('lists.form.name')}
        placeholder={t('lists.form.name')}
        data-autofocus
        autoComplete="off"
        {...form.getInputProps('name')}
      />
      <div className="flex justify-end gap-2">
        <Button variant="light" color="gray" onClick={requestClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="light" type="submit" loading={create.isPending || rename.isPending}>
          {list ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </form>
  );
  const title = list ? t('lists.form.editTitle') : t('lists.form.newTitle');
  const transitionProps = { duration: 200, onExited: () => form.reset() };

  if (isDesktop) {
    return (
      <Drawer opened={opened} onClose={requestClose} position="right" title={title} transitionProps={transitionProps}>
        {body}
      </Drawer>
    );
  }
  return (
    <Modal
      opened={opened}
      onClose={requestClose}
      fullScreen
      title={title}
      transitionProps={{ ...transitionProps, transition: 'fade-down' }}
    >
      {body}
    </Modal>
  );
}
