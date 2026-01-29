import { TrashIcon } from '@phosphor-icons/react/dist/ssr';
import { Button, type ButtonProps } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { type Label, useLabel } from '../../../../hooks/use-label';
import { BaseModalContent } from '../../../base-modal-content';

export interface DeleteModalContentProps {
  onClose: () => void;
  label: Label;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>;
  confirmProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
}

export function DeleteModalContent({
  onCancel,
  label,
  onClose,
  onConfirm,
  cancelProps,
  confirmProps,
  closeOnConfirm = true,
  closeOnCancel = true,
}: DeleteModalContentProps) {
  const { t } = useTranslation();
  const { singular, gender, short } = useLabel(label);

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    typeof cancelProps?.onClick === 'function' && cancelProps.onClick(event);
    typeof onCancel === 'function' && onCancel();
    closeOnCancel && onClose();
  };

  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    typeof confirmProps?.onClick === 'function' && confirmProps.onClick(event);
    typeof onConfirm === 'function' && onConfirm();
    closeOnConfirm && onClose();
  };

  return (
    <BaseModalContent
      icon={<TrashIcon />}
      title={t({
        pt: `Apagar ${singular}`,
        en: `Delete ${singular}`,
        es: `Eliminar ${singular}`,
      })}
      description={t({
        pt: `Tem certeza de que deseja apagar ${gender === 'feminine' ? 'esta' : 'este'} ${singular}? Esta ação não pode ser desfeita.`,
        en: `Are you sure you want to delete this ${singular}? This action cannot be undone.`,
        es: `¿Estás seguro de que quieres eliminar ${gender === 'feminine' ? 'esta' : 'este'} ${singular}? Esta acción no se puede deshacer.`,
      })}
      buttons={
        <>
          <Button variant="default" {...cancelProps} onClick={handleCancel}>
            {t({ pt: 'Não apagar', en: "Don't delete it", es: 'No eliminar' })}
          </Button>
          <Button color="red" {...confirmProps} onClick={handleConfirm}>
            {t({
              pt: `Apagar ${short.singular}`,
              en: `Delete ${short.singular}`,
              es: `Eliminar ${short.singular}`,
            })}
          </Button>
        </>
      }
      styles={{
        iconWrapper: {
          backgroundColor: 'var(--mantine-color-red-light)',
          color: 'var(--mantine-color-red-light-color)',
        },
      }}
    />
  );
}
