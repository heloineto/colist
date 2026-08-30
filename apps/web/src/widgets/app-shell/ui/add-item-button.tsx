import { ActionIcon, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { useItemForm } from '@/features/items';

function useAddItem() {
  const { t } = useTranslation();
  const { listId } = useSelectedList();
  const itemForm = useItemForm();
  return () => {
    if (listId === null) {
      notifications.show({ color: 'red', message: t('errors.noListSelected') });
      return;
    }
    itemForm.open();
  };
}

export function AddItemNavButton({ expanded }: { expanded: boolean }) {
  const { t } = useTranslation();
  const add = useAddItem();
  return (
    <Button
      radius="xl"
      className="h-[42px] justify-start overflow-hidden px-2! transition-[width] duration-200"
      style={{ width: expanded ? '100%' : 42 }}
      leftSection={<PlusIcon size="1.5rem" weight="bold" />}
      onClick={add}
      aria-label={t('shell.addItem')}
    >
      <span
        className="transition-opacity duration-150"
        style={{ opacity: expanded ? 1 : 0 }}
      >
        {t('shell.addItem')}
      </span>
    </Button>
  );
}

export function AddItemFooterButton() {
  const { t } = useTranslation();
  const add = useAddItem();
  return (
    <div className="relative -mt-8 flex items-start">
      <svg
        width="86"
        height="55"
        viewBox="0 0 86 55"
        className="dark:fill-dark-700 absolute -top-0.5 left-1/2 -translate-x-1/2 fill-white"
        aria-hidden
      >
        <path d="M0 55C0 40 12 32 20 32c8 0 8-26 23-26s15 26 23 26c8 0 20 8 20 23z" />
      </svg>
      <ActionIcon
        variant="filled"
        radius="4.5rem"
        size="4.5rem"
        className="relative border-none!"
        onClick={add}
        aria-label={t('shell.addItem')}
      >
        <PlusIcon size="2rem" weight="bold" />
      </ActionIcon>
    </div>
  );
}
