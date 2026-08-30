import { ActionIcon, Badge, Menu, ScrollArea, TextInput } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { CrownSimpleIcon, DotsThreeVerticalIcon, PlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { invalidateList } from '@/entities/list';
import { UserAvatar } from '@/entities/user';
import { MemberPreview } from '@/features/members/ui/member-preview';
import { ApiError } from '@/shared/api/fetcher';
import { useMembershipsRemove } from '@/shared/api/generated/memberships/memberships';
import type { ListsDtoOutputItem, MembersDtoOutputItem } from '@/shared/api/generated/models';
import { usersLookup } from '@/shared/api/generated/users/users';
import { confirm } from '@/shared/ui/confirm';
import { ModalHeader } from '@/shared/ui/modal-header';

type Props = { list: ListsDtoOutputItem; members: MembersDtoOutputItem[] };

function AddMemberForm({ list, members }: Props) {
  const { t } = useTranslation();
  const form = useForm({ initialValues: { email: '' }, validate: { email: isEmail(t('auth.validation.email')) } });

  const lookup = async (email: string) => {
    if (members.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      notifications.show({ color: 'red', message: t('share.duplicate') });
      return;
    }
    try {
      const user = await usersLookup({ email });
      modals.open({ withCloseButton: false, children: <MemberPreview list={list} user={user} />, onClose: () => form.reset() });
    } catch (error) {
      const notFound = error instanceof ApiError && error.status === 404;
      notifications.show({ color: 'red', message: notFound ? t('share.notFound') : t('errors.unexpected') });
    }
  };

  return (
    <form onSubmit={form.onSubmit(({ email }) => void lookup(email.trim()))}>
      <TextInput radius="xl" type="email" placeholder={t('share.emailPlaceholder')} {...form.getInputProps('email')}
        rightSection={<ActionIcon className="mr-px" radius="xl" type="submit" aria-label={t('share.addMember')}><PlusIcon size="1rem" weight="bold" /></ActionIcon>} />
    </form>
  );
}

function MemberRow({ list, member, canManage }: { list: ListsDtoOutputItem; member: MembersDtoOutputItem; canManage: boolean }) {
  const { t } = useTranslation();
  const remove = useMembershipsRemove({ mutation: { onSuccess: () => invalidateList(list.id) } });
  const isOwner = member.role === 'owner';

  return (
    <div className="flex items-center gap-3">
      <UserAvatar name={member.name} image={member.image} />
      <div className="min-w-0 grow">
        <p className="truncate text-sm font-bold">{member.name || t('share.noName')}</p>
        <p className="truncate text-sm text-dimmed">{member.email}</p>
      </div>
      <Badge variant="light" color={isOwner ? 'orange' : 'blue'} className="shrink-0" classNames={{ label: 'flex items-center gap-1' }}>
        {isOwner && <CrownSimpleIcon size="1rem" weight="fill" />}
        {t(`share.role.${member.role}`)}
      </Badge>
      {canManage && (
        <Menu shadow="md" width={200} position="bottom-end" withArrow offset={4}>
          <Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={t('shell.moreOptions')}><DotsThreeVerticalIcon size="1.125rem" weight="bold" /></ActionIcon></Menu.Target>
          <Menu.Dropdown>
            <Menu.Item color="red" disabled={isOwner} onClick={() => confirm({
              title: t('share.remove.title'),
              message: t('share.remove.message', { member: member.name, list: list.name }),
              cancel: t('share.remove.cancel'),
              confirm: t('share.remove.confirm'),
              onConfirm: () => remove.mutate({ listId: list.id, userId: member.userId }),
            })}>
              {t('share.remove.menu')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
}

export function MembersModal({ list, members }: Props) {
  const { t } = useTranslation();
  const canManage = list.role === 'owner';

  return (
    <>
      <ModalHeader icon={<UsersThreeIcon />} title={t('share.title')} description={t('share.subtitle', { name: list.name })} />
      <ScrollArea.Autosize mah="calc(100dvh - var(--modal-y-offset) * 2 - 75px)">
        <div className="flex flex-col gap-3 p-4">
          {canManage && <AddMemberForm list={list} members={members} />}
          {members.map((member) => <MemberRow key={member.userId} list={list} member={member} canManage={canManage} />)}
        </div>
      </ScrollArea.Autosize>
    </>
  );
}
