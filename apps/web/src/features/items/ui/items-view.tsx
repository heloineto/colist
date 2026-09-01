import { Accordion, Alert, Button, Divider, Skeleton } from '@mantine/core';
import { PlusIcon, ShoppingCartIcon } from '@phosphor-icons/react';
import { keepPreviousData } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  groupByCategory,
  itemHeight,
  splitChecked,
} from '@/features/items/lib/group';
import { useItemForm } from '@/features/items/model/item-form-context';
import { ItemRow } from '@/features/items/ui/item-row';
import { useCategories } from '@/shared/api/generated/categories/categories';
import { useItems } from '@/shared/api/generated/items/items';
import type { ItemsDtoOutputItem } from '@/shared/api/generated/models';
import { useListUi } from '@/shared/lib/list-ui-state';
import { useListOptions } from '@/shared/lib/preferences';
import { EmptyState } from '@/shared/ui/empty-state';

function Rows({
  items,
  search,
}: {
  items: ItemsDtoOutputItem[];
  search: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {items.map((item) => (
        <motion.div
          key={item.clientId ?? item.id}
          className="relative shrink-0 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: itemHeight(item), opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <ItemRow item={item} search={search} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function Grouped({
  items,
  search,
  listId,
}: {
  items: ItemsDtoOutputItem[];
  search: string;
  listId: number;
}) {
  const { t, i18n } = useTranslation();
  const categoriesQuery = useCategories(listId);
  const groups = groupByCategory(
    items,
    categoriesQuery.data ?? [],
    i18n.language
  );
  return groups.map((group) => (
    <div key={group.id ?? 'none'} className="flex flex-col">
      <div className="flex h-7 items-end">
        <Divider
          className="grow"
          px="sm"
          labelPosition="left"
          label={group.name ?? t('items.noCategory')}
        />
      </div>
      <Rows items={group.items} search={search} />
    </div>
  ));
}

function Skeletons() {
  return Array.from({ length: 11 }, (_, row) => (
    <div key={row} className="flex items-center justify-between p-3">
      <div className="flex items-center gap-4">
        <Skeleton h={28} w={28} circle />
        <Skeleton h={18} w={100 + (row % 4) * 20} />
      </div>
      <Skeleton h={20} w={31} circle />
    </div>
  ));
}

export function ItemsView({ listId }: { listId: number }) {
  const { t } = useTranslation();
  const { debouncedSearch, searchOpened, closeSearch } = useListUi();
  const [{ sort, order, groupBy }] = useListOptions();
  const itemForm = useItemForm();
  const itemsQuery = useItems(
    listId,
    { sort, order, ...(debouncedSearch ? { search: debouncedSearch } : {}) },
    { query: { placeholderData: keepPreviousData } }
  );
  const [accordion, setAccordion] = useState<string | null>(null);
  const items = itemsQuery.data;
  const { checked, unchecked } = splitChecked(items ?? []);

  useEffect(() => {
    if (searchOpened && debouncedSearch) setAccordion('checked');
  }, [searchOpened, debouncedSearch]);
  useEffect(() => {
    if (items && unchecked.length === 0 && checked.length > 0) {
      setAccordion('checked');
    }
  }, [items, unchecked.length, checked.length]);

  // A failed refetch keeps the cached items (offline); only an empty cache is an error.
  if (itemsQuery.isError && !items) {
    return (
      <Alert
        color="red"
        title={t('errors.loadItems')}
        radius={0}
        className="grow"
      >
        <Button
          variant="light"
          color="red"
          size="xs"
          onClick={() => void itemsQuery.refetch()}
        >
          {t('common.retry')}
        </Button>
      </Alert>
    );
  }
  if (!items) return <Skeletons />;
  if (items.length === 0) {
    const filtered = Boolean(debouncedSearch);
    return (
      <EmptyState
        icon={ShoppingCartIcon}
        title={filtered ? t('items.noResults.title') : t('items.empty.title')}
        description={
          filtered
            ? t('items.noResults.description')
            : t('items.empty.description')
        }
        action={
          filtered ? (
            <Button size="sm" variant="light" onClick={closeSearch}>
              {t('items.removeFilters')}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="light"
              leftSection={<PlusIcon size="1rem" weight="bold" />}
              onClick={() => itemForm.open()}
            >
              {t('shell.addItem')}
            </Button>
          )
        }
      />
    );
  }

  const search = debouncedSearch;
  const render = (subset: ItemsDtoOutputItem[]) =>
    groupBy === 'category' ? (
      <Grouped items={subset} search={search} listId={listId} />
    ) : (
      <Rows items={subset} search={search} />
    );

  return (
    <div className="flex flex-col pb-4">
      <div className="flex flex-col pt-1">{render(unchecked)}</div>
      <Accordion
        value={accordion}
        onChange={setAccordion}
        classNames={{ content: 'p-0!' }}
      >
        <Accordion.Item
          value="checked"
          className={`border-b-0! ${unchecked.length > 0 ? 'dark:border-dark-400 mt-2 border-t border-solid border-gray-300' : ''}`}
        >
          <Accordion.Control
            className="px-3! font-medium"
            disabled={checked.length === 0}
          >
            {t('items.completed', { count: checked.length })}
          </Accordion.Control>
          <Accordion.Panel>
            <div className="flex flex-col">{render(checked)}</div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
