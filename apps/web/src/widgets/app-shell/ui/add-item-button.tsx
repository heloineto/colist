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
    <div className="absolute top-0 right-4 h-full">
      <svg
        width="86"
        height="55"
        viewBox="0 0 86 55"
        className="dark:fill-dark-700 absolute top-0 left-1/2 -translate-x-1/2 fill-white"
        aria-hidden
      >
        <path d="M1.69674 0C0.592107 3.80865 0 7.83518 0 12C0 35.7482 19.2518 55 43 55C66.7482 55 86 35.7482 86 12C86 7.83518 85.4079 3.80865 84.3033 0H1.69674Z" />
      </svg>
      <ActionIcon
        variant="filled"
        radius="4.5rem"
        size="4.5rem"
        className="relative -mt-6 border-none!"
        onClick={add}
        aria-label={t('shell.addItem')}
      >
        <PlusIcon size="2rem" weight="bold" />
      </ActionIcon>
    </div>
  );
}
