import { useMemo } from 'react';
import { Divider } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { getItemHeight } from '../../../item/utils/get-item-height';
import { Item } from '../../../item/item';
import type { Item as ItemType } from '@/deprecated/utils/queries/items';
import type { Category } from '@/deprecated/utils/queries/categories';

interface Props {
  items: ItemType[];
}

export function GroupedItems({ items }: Props) {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    const grouped = { none: [] } as {
      [key: string]: ItemType[];
      none: ItemType[];
    };

    for (const item of items) {
      if (item.category === null) {
        grouped.none.push(item);
        continue;
      }

      const { id } = item.category;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --- TypeScript cannot infer that `id` the record might not exist yet
      if (grouped[id]) {
        grouped[id].push(item);
      } else {
        grouped[id] = [item];
      }
    }

    return Object.entries(grouped)
      .filter(([_, i]) => i.length)
      .sort(([categoryIdA, itemsA], [categoryIdB, itemsB]) => {
        if (categoryIdA === 'none') return 1;
        if (categoryIdB === 'none') return -1;

        const nameA = itemsA[0].category?.name ?? '';
        const nameB = itemsB[0].category?.name ?? '';

        return nameA.localeCompare(nameB);
      })
      .flatMap(([categoryId, categoryItems]) => {
        if (categoryId === 'none') {
          return [
            {
              isCategory: true,
              id: 'none',
              name: t({
                pt: 'Sem categoria',
                en: 'No category',
                es: 'Sin categoría',
              }),
            },
            ...categoryItems,
          ];
        }

        const category = categoryItems[0].category as Category;

        return [
          {
            isCategory: true,
            id: String(category.id),
            name: category.name,
          },
          ...categoryItems,
        ];
      });
  }, [items, t]);

  return (
    <AnimatePresence initial={false}>
      {groups.map((item) => {
        if ('isCategory' in item) {
          return (
            <motion.div
              key={`category-${item.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 28, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex h-7 items-end">
                <Divider
                  className="grow"
                  px="sm"
                  labelPosition="left"
                  label={item.name}
                />
              </div>
            </motion.div>
          );
        }

        const height = getItemHeight(item);

        return (
          <motion.div
            className="relative shrink-0"
            key={`item-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="absolute top-0 left-0 size-full">
              <Item item={item} />
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
