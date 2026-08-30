import { modals } from '@mantine/modals';
import i18next from 'i18next';

type ConfirmOptions = {
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  color?: string;
  onConfirm: () => void;
};

export function confirm({ title, message, cancel, confirm: confirmLabel, color = 'red', onConfirm }: ConfirmOptions) {
  modals.openConfirmModal({
    title,
    children: message,
    labels: { cancel, confirm: confirmLabel },
    confirmProps: { color },
    onConfirm,
  });
}

/** `label` is the already-translated thing, e.g. `item "Leite"`. */
export function confirmDelete(label: string, onConfirm: () => void) {
  confirm({
    title: i18next.t('confirm.delete.title', { label }),
    message: i18next.t('confirm.delete.message', { label }),
    cancel: i18next.t('confirm.delete.cancel'),
    confirm: i18next.t('confirm.delete.confirm'),
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
