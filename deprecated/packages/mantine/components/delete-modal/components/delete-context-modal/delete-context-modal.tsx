import { modals, type ContextModalProps } from '@mantine/modals';
import {
  DeleteModalContent,
  type DeleteModalContentProps,
} from '../delete-modal-content/delete-modal-content';

type ModalSettings = Parameters<typeof modals.open>[0];
export type DeleteModalContextInnerProps = Omit<
  DeleteModalContentProps,
  'onClose'
>;

export function openDeleteModal({
  modal,
  ...innerProps
}: DeleteModalContextInnerProps & {
  modal?: ModalSettings;
}) {
  modals.openContextModal({
    modal: 'delete',
    centered: true,
    withCloseButton: false,
    innerProps,
    ...modal,
  });
}

export function DeleteContextModal({
  context,
  id,
  innerProps,
}: ContextModalProps<DeleteModalContextInnerProps>) {
  return (
    <DeleteModalContent
      onClose={() => context.closeModal(id)}
      {...innerProps}
    />
  );
}
