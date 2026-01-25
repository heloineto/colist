import { modals, type ContextModalProps } from '@mantine/modals';
import type { FeedbackModalContentProps } from './feedback-modal-content';
import { FeedbackModalContent } from './feedback-modal-content';

type ModalSettings = Parameters<typeof modals.open>[0];
export type FeedbackModalContextInnerProps = Omit<
  FeedbackModalContentProps,
  'onClose'
>;

export function openFeedbackModal({
  modal,
  ...innerProps
}: FeedbackModalContextInnerProps & {
  modal?: ModalSettings;
}) {
  modals.openContextModal({
    modal: 'feedback',
    centered: true,
    styles: { body: { padding: 0 } },
    withCloseButton: false,
    innerProps,
    ...modal,
  });
}

export function FeedbackContextModal({
  context,
  id,
  innerProps,
}: ContextModalProps<FeedbackModalContextInnerProps>) {
  return (
    <FeedbackModalContent
      onClose={() => context.closeModal(id)}
      {...innerProps}
    />
  );
}
