import { Modal, type ModalProps } from '@mantine/core';
import {
  DiscardModalContent,
  type DiscardModalContentProps,
} from './components';

export interface DiscardModalProps extends DiscardModalContentProps {
  opened: boolean;
  onClose: () => void;
  modalProps: Partial<ModalProps>;
}

export function DiscardModal({
  opened,
  onClose,
  modalProps,
  ...rest
}: DiscardModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      {...modalProps}
    >
      <DiscardModalContent onClose={onClose} {...rest} />
    </Modal>
  );
}
