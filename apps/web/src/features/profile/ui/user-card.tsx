import { Button, Modal, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NotePencilIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/entities/user';
import { ProfileForm } from '@/features/profile/ui/profile-form';
import type { MeDtoOutput } from '@/shared/api/generated/models';

export function UserCard({ me }: { me: MeDtoOutput | undefined }) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  if (!me) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton circle h={56} w={56} />
        <div className="flex flex-col gap-2"><Skeleton h={16} w={128} /><Skeleton h={12} w={160} /></div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={me.name} image={me.image} size="xl" />
      <div className="min-w-0">
        <p className="truncate text-lg leading-6 font-medium">{me.name || t('profile.noName')}</p>
        <p className="truncate leading-6 text-dimmed">{me.email}</p>
        <Button size="compact-xs" variant="subtle" radius="xl" px="0.375rem" className="uppercase" leftSection={<NotePencilIcon size="1rem" weight="bold" />} onClick={open}>
          {t('profile.edit')}
        </Button>
      </div>
      <Modal opened={opened} onClose={close} title={t('profile.edit')}>
        <ProfileForm me={me} onDone={close} />
      </Modal>
    </div>
  );
}
