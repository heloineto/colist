import { Modal, type ModalProps } from '@mantine/core';
import {
  FeedbackModalContent,
  type FeedbackModalContentProps,
} from './components/feedback-modal-content';

export interface FeedbackModalProps extends FeedbackModalContentProps {
  opened: boolean;
  onClose: () => void;
  modalProps: Partial<ModalProps>;
}

export function FeedbackModal({
  opened,
  onClose,
  modalProps,
  ...rest
}: FeedbackModalProps) {
  return (
    <Modal
      withCloseButton={false}
      classNames={{ body: '!p-0' }}
      opened={opened}
      onClose={onClose}
      {...modalProps}
    >
      <FeedbackModalContent onClose={onClose} {...rest} />
    </Modal>
  );
}
