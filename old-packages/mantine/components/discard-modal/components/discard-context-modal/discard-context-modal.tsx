import { modals, type ContextModalProps } from '@mantine/modals';
import {
  DiscardModalContent,
  type DiscardModalContentProps,
} from '../discard-modal-content';

type ModalSettings = Parameters<typeof modals.open>[0];
export type DiscardModalContextInnerProps = Omit<
  DiscardModalContentProps,
  'onClose'
>;

export function openDiscardModal({
  modal,
  ...innerProps
}: DiscardModalContextInnerProps & {
  modal?: ModalSettings;
}) {
  modals.openContextModal({
    modal: 'discard',
    centered: true,
    withCloseButton: false,
    innerProps,
    ...modal,
  });
}

export function DiscardContextModal({
  context,
  id,
  innerProps,
}: ContextModalProps<DiscardModalContextInnerProps>) {
  return (
    <DiscardModalContent
      onClose={() => context.closeModal(id)}
      {...innerProps}
    />
  );
}
