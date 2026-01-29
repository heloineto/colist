import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Drawer, NavLink, Tooltip } from '@mantine/core';
import {
  BugBeetle,
  ChatCircle,
  DotsThree,
  NotePencil,
  Trash,
} from '@phosphor-icons/react/dist/ssr';
import { useUncontrolled } from '@mantine/hooks';
import { useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { showNotification } from '@mantine/notifications';
import { openDeleteModal } from '@/deprecated/packages/mantine';
import { useListForm } from '@/app/app/_utils/list-form-context';
import { useListContext } from '@/app/app/_utils/list-context';
import { LISTS_COLUMNS, LISTS_TABLE } from '@/deprecated/utils/queries/lists';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { openFeedbackModal } from '@/components/feedback-modal/components/feedback-context-modal';

interface Props {
  mode?: 'nav' | 'footer';
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (value: boolean) => void;
}

export function MoreOptionsButton({
  mode = 'footer',
  defaultOpened,
  onChange,
  opened,
}: Props) {
  const { t } = useTranslation();
  const listForm = useListForm();
  const label = t({
    pt: 'Mais opções',
    en: 'More options',
    es: 'Más opciones',
  });
  const [_opened, handleChange] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const { listId, listsQuery } = useListContext();
  const deleteMutation = useDeleteMutation(
    supabase.from(LISTS_TABLE),
    ['id'],
    LISTS_COLUMNS,
    { onSuccess: () => handleChange(false) }
  );

  const content = (
    <>
      <NavLink
        className="!px-md"
        component="button"
        type="button"
        leftSection={<NotePencil size="1.125rem" />}
        label={t({
          pt: 'Modificar lista',
          en: 'Modify list',
          es: 'Modificar lista',
        })}
        onClick={() => {
          const list = listsQuery.data?.find((l) => l.id === listId);

          if (!list) {
            showNotification({
              message: t({
                pt: 'A lista selecionada não foi encontrada',
                en: 'The selected list was not found',
                es: 'No se encontró la lista seleccionada',
              }),
              color: 'red',
            });
            return;
          }

          listForm.reset(listForm.fromDatabase(list));
          listForm.disclosure.open();
          handleChange(false);
        }}
      />
      <NavLink
        className="!px-md"
        component="button"
        type="button"
        leftSection={<Trash size="1.125rem" />}
        onClick={() => {
          if (!listId) {
            showNotification({
              title: t({ pt: 'Erro', en: 'Error', es: 'Error' }),
              message: t({
                pt: 'Nenhuma lista selecionada',
                en: 'No list selected',
                es: 'Ninguna lista seleccionada',
              }),
              color: 'red',
            });
            return;
          }

          openDeleteModal({
            label: {
              singular: t({
                pt: 'lista de compras',
                en: 'shopping list',
                es: 'lista de compras',
              }),
            },
            onConfirm: () => deleteMutation.mutate({ id: listId }),
          });
        }}
        label={t({
          pt: 'Apagar lista',
          en: 'Delete list',
          es: 'Eliminar lista',
        })}
      />
      <NavLink
        className="!px-md"
        component="button"
        type="button"
        leftSection={<ChatCircle size="1.125rem" />}
        label={t({
          pt: 'Deixar feedback',
          en: 'Leave feedback',
          es: 'Dejar feedback',
        })}
        onClick={() => openFeedbackModal({ initialTab: 'feedback' })}
      />
      <NavLink
        className="!px-md"
        component="button"
        type="button"
        leftSection={<BugBeetle size="1.125rem" />}
        label={t({
          pt: 'Reportar erro',
          en: 'Report error',
          es: 'Reportar error',
        })}
        onClick={() => openFeedbackModal({ initialTab: 'error' })}
      />
    </>
  );

  if (mode === 'nav') {
    return (
      <NavLink
        label={label}
        component="button"
        leftSection={<DotsThree size="1.25rem" weight="bold" />}
        opened={opened}
        onChange={handleChange}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <>
      <Tooltip label={label} openDelay={0}>
        <ActionIcon
          variant="subtle"
          size="2.25rem"
          color="gray"
          radius="md"
          onClick={() => handleChange(!_opened)}
        >
          <DotsThree size="1.375rem" weight="bold" />
        </ActionIcon>
      </Tooltip>
      <Drawer
        opened={_opened}
        onClose={() => handleChange(false)}
        position="bottom"
        size={203}
        withCloseButton={false}
        classNames={{
          content: '!rounded-t-lg',
          body: '!px-0 !py-xs flex flex-col',
        }}
      >
        {content}
        <div className="text-dimmed flex h-5 items-center justify-center text-xs">
          Alpha v0.0.1
        </div>
      </Drawer>
    </>
  );
}
