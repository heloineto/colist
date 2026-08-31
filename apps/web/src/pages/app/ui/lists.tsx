import { Button } from '@mantine/core';
import { PlusIcon, ShoppingCartIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { ItemsView } from '@/features/items';
import { useListForm } from '@/features/lists';
import { EmptyState } from '@/shared/ui/empty-state';

export function Lists() {
  const { t } = useTranslation();
  const { lists, listId } = useSelectedList();
  const listForm = useListForm();
  const previousIndex = useRef(0);

  if (!lists) return null;
  if (lists.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCartIcon}
        title={t('lists.empty.noLists.title')}
        description={t('lists.empty.noLists.description')}
        action={
          <Button
            size="sm"
            variant="light"
            leftSection={<PlusIcon size="1rem" weight="bold" />}
            onClick={() => listForm.open()}
          >
            {t('shell.newList')}
          </Button>
        }
      />
    );
  }
  if (listId === null) {
    return (
      <EmptyState
        icon={ShoppingCartIcon}
        title={t('lists.empty.noneSelected.title')}
        description={t('lists.empty.noneSelected.description')}
      />
    );
  }

  const index = lists.findIndex((list) => list.id === listId);
  const direction = index >= previousIndex.current ? 1 : -1;
  previousIndex.current = index;

  return (
    <div
      className="relative grow"
      style={{ '--direction': direction } as React.CSSProperties}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={listId}
          className="absolute top-0 flex size-full flex-col"
          initial={{ left: 'calc(var(--direction) * 100%)' }}
          animate={{ left: '0%' }}
          exit={{ left: 'calc(var(--direction) * -100%)' }}
        >
          <ItemsView listId={listId} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
