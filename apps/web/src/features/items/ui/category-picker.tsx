import {
  ActionIcon,
  Button,
  Highlight,
  Modal,
  Radio,
  ScrollArea,
  Skeleton,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  PencilSimpleIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invalidateList } from '@/entities/list';
import { CategoryRenameForm } from '@/features/items/ui/category-rename-form';
import {
  useCategories,
  useCategoriesCreate,
  useCategoriesDelete,
} from '@/shared/api/generated/categories/categories';
import type { CategoriesDtoOutputItem } from '@/shared/api/generated/models';
import { confirmDelete } from '@/shared/ui/confirm';
import { EmptyState } from '@/shared/ui/empty-state';
import { ModalHeader } from '@/shared/ui/modal-header';

type Props = {
  listId: number;
  value: number | null;
  onChange: (categoryId: number | null) => void;
};

export function CategoryButton({ listId, value, onChange }: Props) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const categoriesQuery = useCategories(listId);
  const selected =
    categoriesQuery.data?.find((category) => category.id === value) ?? null;

  return (
    <>
      <Tooltip
        label={
          selected ? t('categories.changeTooltip') : t('categories.addTooltip')
        }
      >
        <ActionIcon
          className="w-auto! px-1.5!"
          variant="subtle"
          size="lg"
          color="gray"
          onClick={open}
        >
          <TagIcon size="1.25rem" />
          {selected && (
            <span className="text-dimmed ml-1.5 max-w-28 truncate text-sm">
              {selected.name}
            </span>
          )}
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        classNames={{ body: 'p-0!' }}
        centered={false}
      >
        <CategoryPicker
          listId={listId}
          value={value}
          onChange={(next) => {
            onChange(next);
            close();
          }}
          categories={categoriesQuery.data}
        />
      </Modal>
    </>
  );
}

function CategoryPicker({
  listId,
  value,
  onChange,
  categories,
}: Props & { categories: CategoriesDtoOutputItem[] | undefined }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const create = useCategoriesCreate({
    mutation: {
      onSuccess: (created) => {
        invalidateList(listId);
        onChange(created.id);
      },
    },
  });
  const remove = useCategoriesDelete({
    mutation: { onSuccess: () => invalidateList(listId) },
  });
  const query = search.trim().toLocaleLowerCase(i18n.language);
  const filtered = categories?.filter((category) =>
    category.name.toLocaleLowerCase(i18n.language).includes(query)
  );
  const exact = categories?.some(
    (category) => category.name.toLocaleLowerCase(i18n.language) === query
  );

  const rename = (category: CategoriesDtoOutputItem) =>
    modals.open({
      title: t('categories.renameTitle'),
      children: <CategoryRenameForm category={category} />,
    });
  const destroy = (category: CategoriesDtoOutputItem) =>
    confirmDelete(t('categories.deleteLabel', { name: category.name }), () => {
      remove.mutate({ listId, categoryId: category.id });
      if (value === category.id) onChange(null);
    });

  return (
    <>
      <ModalHeader
        icon={<TagIcon />}
        title={t('categories.title')}
        description={t('categories.description')}
      />
      <div className="p-4 pb-2">
        <TextInput
          radius="xl"
          type="search"
          data-autofocus
          placeholder={t('categories.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </div>
      <ScrollArea.Autosize mah="calc(100dvh - var(--modal-y-offset) * 2 - 142px)">
        <div className="flex flex-col gap-3 px-4 pb-4">
          {query && !exact && (
            <Button
              variant="transparent"
              size="compact-sm"
              h="1.75rem"
              px={0}
              fz={16}
              fw={400}
              loading={create.isPending}
              leftSection={
                <span className="bg-primary-light flex size-5 items-center justify-center rounded-full">
                  <PlusIcon size="1rem" />
                </span>
              }
              onClick={() =>
                create.mutate({ listId, data: { name: search.trim() } })
              }
            >
              {t('categories.addNamed', { name: search.trim() })}
            </Button>
          )}
          {!filtered &&
            [1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton circle h={21} w={21} />
                <Skeleton h={16} w={100 + row * 15} />
              </div>
            ))}
          {filtered && filtered.length === 0 && (
            <EmptyState
              size="sm"
              icon={TagIcon}
              title={
                query
                  ? t('categories.noResults.title')
                  : t('categories.empty.title')
              }
              description={
                query
                  ? t('categories.noResults.description')
                  : t('categories.empty.description')
              }
            />
          )}
          {filtered && filtered.length > 0 && (
            <Radio.Group
              value={value === null ? '' : String(value)}
              onChange={(next) => onChange(Number(next))}
              name="categoryId"
              size="md"
            >
              <div className="flex flex-col gap-3">
                {filtered.map((category) => (
                  <div key={category.id} className="flex items-center gap-1">
                    <Radio
                      classNames={{
                        root: 'grow',
                        body: 'items-center',
                        label: 'grow',
                      }}
                      value={String(category.id)}
                      label={
                        <Highlight highlight={search}>
                          {category.name}
                        </Highlight>
                      }
                    />
                    <ActionIcon
                      color="gray"
                      variant="subtle"
                      onClick={() => rename(category)}
                      aria-label={t('categories.rename')}
                    >
                      <PencilSimpleIcon size="1rem" />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => destroy(category)}
                      aria-label={t('common.remove')}
                    >
                      <TrashIcon size="1rem" />
                    </ActionIcon>
                  </div>
                ))}
              </div>
            </Radio.Group>
          )}
        </div>
      </ScrollArea.Autosize>
    </>
  );
}
