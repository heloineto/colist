import { Modal, type ModalProps } from '@mantine/core';
import {
  DeleteModalContent,
  type DeleteModalContentProps,
} from './components/delete-modal-content';

export interface DeleteModalProps extends DeleteModalContentProps {
  opened: boolean;
  onClose: () => void;
  modalProps: Partial<ModalProps>;
}

export function DeleteModal({
  opened,
  onClose,
  modalProps,
  ...rest
}: DeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      {...modalProps}
    >
      <DeleteModalContent onClose={onClose} {...rest} />
    </Modal>
  );
}
