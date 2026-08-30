import { FileInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { PaperclipIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IMAGE_TYPES, uploadFile } from '@/shared/api/upload';

/** Uploads each picked image through a presigned PUT and reports the stored keys. */
export function AttachmentsInput({
  onChange,
}: {
  onChange: (keys: string[]) => void;
}) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const pick = async (picked: File[]) => {
    setFiles(picked);
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        picked.map((file) => uploadFile('attachment', file))
      );
      onChange(uploaded.map((result) => result.key));
    } catch {
      notifications.show({ color: 'red', message: t('errors.upload') });
      setFiles([]);
      onChange([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileInput
      multiple
      clearable
      accept={IMAGE_TYPES}
      label={t('feedback.attachments')}
      leftSection={<PaperclipIcon size="1rem" />}
      value={files}
      onChange={(picked) => void pick(picked)}
      disabled={uploading}
    />
  );
}
