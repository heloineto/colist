import { useTranslation } from 'react-i18next';
import { useListForm } from '@/features/lists/model/list-form-context';
import {
  useListsDelete,
  useListsLeave,
} from '@/shared/api/generated/lists/lists';
import type { ListsDtoOutputItem } from '@/shared/api/generated/models';
import { confirm, confirmDelete } from '@/shared/ui/confirm';

export function useListActions(list: ListsDtoOutputItem | null) {
  const { t } = useTranslation();
  const listForm = useListForm();
  const remove = useListsDelete({
    mutation: { meta: { success: t('lists.deleted') } },
  });
  const leave = useListsLeave();

  if (!list) return null;
  return {
    isOwner: list.role === 'owner',
    edit: () => listForm.open(list),
    remove: () =>
      confirmDelete(t('lists.deleteLabel'), () =>
        remove.mutate({ listId: list.id })
      ),
    leave: () =>
      confirm({
        title: t('lists.leave.title'),
        message: t('lists.leave.message', { name: list.name }),
        cancel: t('lists.leave.cancel'),
        confirm: t('lists.leave.confirm'),
        onConfirm: () => leave.mutate({ listId: list.id }),
      }),
  };
}
