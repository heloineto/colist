import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import { Button, type ButtonProps } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { BaseModalContent } from '../../../base-modal-content';

export interface DiscardModalContentProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose: () => void;
  cancelProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>;
  confirmProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
}

export function DiscardModalContent({
  onCancel,
  onClose,
  onConfirm,
  cancelProps,
  confirmProps,
  closeOnConfirm = true,
  closeOnCancel = true,
}: DiscardModalContentProps) {
  const { t } = useTranslation();

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
      icon={<WarningIcon />}
      title={t({
        pt: 'Descartar alterações',
        en: 'Discard changes',
        es: 'Descartar cambios',
      })}
      description={t({
        pt: 'Existem alterações não salvas. Tem certeza que deseja fechar o painel? Suas alterações serão perdidas.',
        en: 'There are unsaved changes. Are you sure you want to close the panel? Your changes will be lost.',
        es: 'Hay cambios sin guardar. ¿Estás seguro de que quieres cerrar el panel? Se perderán tus cambios.',
      })}
      buttons={
        <>
          <Button variant="default" {...cancelProps} onClick={handleCancel}>
            {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
          </Button>
          <Button color="orange" {...confirmProps} onClick={handleConfirm}>
            {t({
              pt: 'Descartar alterações',
              en: 'Discard changes',
              es: 'Descartar cambios',
            })}
          </Button>
        </>
      }
      styles={{
        iconWrapper: {
          backgroundColor: 'var(--mantine-color-orange-light)',
          color: 'var(--mantine-color-orange-light-color)',
        },
      }}
    />
  );
}
