import { Avatar, Button, Modal, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ShareNetworkIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/entities/user';
import { MembersModal } from '@/features/members/ui/members-modal';
import { useMemberships } from '@/shared/api/generated/memberships/memberships';
import type { ListsDtoOutputItem } from '@/shared/api/generated/models';

const MAX_AVATARS = 4;

export function ShareButton({ list }: { list: ListsDtoOutputItem | null }) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const membersQuery = useMemberships(list?.id ?? 0, {
    query: { enabled: list !== null },
  });
  const members = membersQuery.data ?? [];

  if (!list) {
    return (
      <Tooltip label={t('share.selectList')}>
        <Button
          size="xs"
          variant="light"
          disabled
          leftSection={<ShareNetworkIcon size="1rem" />}
        >
          {t('share.invite')}
        </Button>
      </Tooltip>
    );
  }

  const trigger =
    members.length <= 1 ? (
      <Button
        size="xs"
        variant="light"
        leftSection={<ShareNetworkIcon size="1rem" />}
        onClick={open}
      >
        {t('share.invite')}
      </Button>
    ) : (
      <Tooltip.Group openDelay={300} closeDelay={100}>
        <Avatar.Group
          spacing="md"
          component="button"
          className="mantine-focus-auto cursor-pointer rounded-sm border-none bg-transparent"
          onClick={open}
        >
          {members
            .slice(
              0,
              members.length > MAX_AVATARS ? MAX_AVATARS - 1 : MAX_AVATARS
            )
            .map((member) => (
              <Tooltip key={member.userId} label={member.name}>
                <UserAvatar name={member.name} image={member.image} />
              </Tooltip>
            ))}
          {members.length > MAX_AVATARS && (
            <Tooltip
              label={members
                .slice(MAX_AVATARS - 1)
                .map((member) => member.name)
                .join(', ')}
            >
              <Avatar radius="xl">+{members.length - MAX_AVATARS + 1}</Avatar>
            </Tooltip>
          )}
        </Avatar.Group>
      </Tooltip.Group>
    );

  return (
    <>
      {trigger}
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        classNames={{ body: 'p-0!' }}
        centered={false}
      >
        <MembersModal list={list} members={members} />
      </Modal>
    </>
  );
}
