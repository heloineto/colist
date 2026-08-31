import { Button, FileButton, Menu, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { CameraIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/entities/user';
import { invalidateMe, useMeUpdate } from '@/shared/api/generated/me/me';
import type { MeDtoOutput } from '@/shared/api/generated/models';
import { queryClient } from '@/shared/api/query-client';
import { IMAGE_TYPES, uploadFile } from '@/shared/api/upload';

export function ProfileForm({
  me,
  onDone,
}: {
  me: MeDtoOutput;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(me.image);
  const [uploading, setUploading] = useState(false);
  const form = useForm({
    initialValues: { name: me.name },
    validate: { name: isNotEmpty(t('auth.validation.name')) },
  });
  const update = useMeUpdate({
    mutation: {
      meta: { success: t('profile.saved') },
      onSuccess: () => {
        void invalidateMe(queryClient);
        onDone();
      },
    },
  });

  const pick = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadFile('avatar', file);
      setImage(publicUrl);
    } catch {
      notifications.show({ color: 'red', message: t('errors.upload') });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.onSubmit(({ name }) =>
        update.mutate({ data: { name, image } })
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          name={form.values.name}
          image={image}
          size={96}
          radius="md"
        />
        <Menu shadow="md" withArrow>
          <Menu.Target>
            <Button variant="light" size="xs" loading={uploading}>
              {t('profile.avatar')}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <FileButton
              accept={IMAGE_TYPES}
              onChange={(file) => void pick(file)}
            >
              {(props) => (
                <Menu.Item {...props} leftSection={<CameraIcon size="1rem" />}>
                  {t('profile.changeAvatar')}
                </Menu.Item>
              )}
            </FileButton>
            <Menu.Item
              color="red"
              disabled={image === null}
              leftSection={<TrashIcon size="1rem" />}
              onClick={() => setImage(null)}
            >
              {t('profile.removeAvatar')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <TextInput
        label={t('profile.name')}
        placeholder={t('profile.noName')}
        {...form.getInputProps('name')}
      />
      <div className="xs:flex-row xs:justify-end flex flex-col-reverse gap-2">
        <Button variant="default" className="xs:min-w-32" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          className="xs:min-w-32"
          loading={update.isPending}
        >
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
