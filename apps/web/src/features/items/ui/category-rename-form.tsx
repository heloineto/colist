import { Button, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { invalidateList } from '@/entities/list';
import { useCategoriesRename } from '@/shared/api/generated/categories/categories';
import type { CategoriesDtoOutputItem } from '@/shared/api/generated/models';

export function CategoryRenameForm({
  category,
}: {
  category: CategoriesDtoOutputItem;
}) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: { name: category.name },
    validate: { name: isNotEmpty(t('lists.form.nameRequired')) },
  });
  const rename = useCategoriesRename({
    mutation: {
      onSuccess: () => {
        invalidateList(category.listId);
        modals.closeAll();
      },
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.onSubmit(({ name }) =>
        rename.mutate({
          listId: category.listId,
          categoryId: category.id,
          data: { name },
        })
      )}
    >
      <TextInput
        data-autofocus
        label={t('lists.form.name')}
        {...form.getInputProps('name')}
      />
      <div className="flex justify-end gap-2">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={rename.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
