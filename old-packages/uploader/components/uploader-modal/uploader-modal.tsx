import { Modal } from '@mantine/core';
import { useState } from 'react';
import {
  DiscardModalContent,
  useSessionQuery,
} from '@information-systems/mantine';
import { useTranslation } from '@information-systems/translations';
import { type SupabaseClient } from '@supabase/supabase-js';
import { QueryBoundary } from '@information-systems/states';
import { Uploader, type UploaderProps } from '../uploader';

export interface UploaderModalProps
  extends Omit<UploaderProps, 'setIsDirty' | 'session'> {
  client: SupabaseClient;
  title?: string;
  opened: boolean;
  onClose: () => void;
}

export function UploaderModal({
  client,
  title,
  opened,
  onClose,
  ...rest
}: UploaderModalProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const { t } = useTranslation();
  const sessionQuery = useSessionQuery(client);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          if (isDirty) {
            setDiscardOpen(true);
            return;
          }

          onClose();
        }}
        size="xl"
        title={
          title ??
          t({
            pt: 'Upload de arquivos',
            en: 'File upload',
            es: 'Subida de archivos',
          })
        }
      >
        <QueryBoundary query={sessionQuery}>
          {({ data: session }) => (
            <Uploader
              setIsDirty={setIsDirty}
              session={session}
              height="min(550px, max(250px, calc(100dvh - 77px - var(--modal-y-offset) * 2)))"
              {...rest}
            />
          )}
        </QueryBoundary>
      </Modal>
      <Modal
        opened={discardOpen}
        onClose={() => setDiscardOpen(false)}
        withCloseButton={false}
      >
        <DiscardModalContent
          onClose={() => setDiscardOpen(false)}
          onConfirm={() => onClose()}
        />
      </Modal>
    </>
  );
}
