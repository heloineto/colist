import { Button, ModalCloseButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { TrashIcon, WarningIcon } from '@phosphor-icons/react';
import i18next from 'i18next';
import type { ReactNode } from 'react';

type ConfirmOptions = {
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  color?: string;
  icon?: ReactNode;
  onConfirm: () => void;
};

export function confirm({
  title,
  message,
  cancel,
  confirm: confirmLabel,
  color = 'red',
  icon = <WarningIcon size="1.5rem" />,
  onConfirm,
}: ConfirmOptions) {
  const modalId = modals.open({
    withCloseButton: false,
    children: (
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: `var(--mantine-color-${color}-light)`,
              color: `var(--mantine-color-${color}-light-color)`,
            }}
          >
            {icon}
          </div>
          <div className="flex grow flex-col gap-1">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-dimmed text-sm">{message}</p>
          </div>
          <ModalCloseButton className="shrink-0" />
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="default" onClick={() => modals.close(modalId)}>
            {cancel}
          </Button>
          <Button
            color={color}
            onClick={() => {
              onConfirm();
              modals.close(modalId);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    ),
  });
}

/** `label` is the already-translated thing, e.g. `item "Leite"`. */
export function confirmDelete(label: string, onConfirm: () => void) {
  confirm({
    title: i18next.t('confirm.delete.title', { label }),
    message: i18next.t('confirm.delete.message', { label }),
    cancel: i18next.t('confirm.delete.cancel'),
    confirm: i18next.t('confirm.delete.confirm'),
    icon: <TrashIcon size="1.5rem" />,
    onConfirm,
  });
}

export function confirmDiscard(onConfirm: () => void) {
  confirm({
    title: i18next.t('confirm.discard.title'),
    message: i18next.t('confirm.discard.message'),
    cancel: i18next.t('confirm.discard.cancel'),
    confirm: i18next.t('confirm.discard.confirm'),
    color: 'orange',
    onConfirm,
  });
}
