import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { invalidateList } from '@/entities/list';
import { UserAvatar, getColor, getInitials } from '@/entities/user';
import { useMembershipsAdd } from '@/shared/api/generated/memberships/memberships';
import type { ListsDtoOutputItem, UserPreviewDtoOutput } from '@/shared/api/generated/models';

export function MemberPreview({ list, user }: { list: ListsDtoOutputItem; user: UserPreviewDtoOutput }) {
  const { t } = useTranslation();
  const add = useMembershipsAdd({
    mutation: {
      meta: { success: t('share.added') },
      onSuccess: () => {
        invalidateList(list.id);
        modals.closeAll();
      },
    },
  });

  return (
    <div className="relative flex flex-col items-center gap-1 pt-8">
      <div className="absolute top-0 left-0 h-24 w-full rounded-t-md" style={{ background: `var(--mantine-color-${getColor(getInitials(user.name))}-light-hover)` }} />
      <UserAvatar name={user.name} image={user.image} size={100} className="z-10 border-[5px] border-solid border-body bg-body" />
      <p className="text-xl font-bold">{user.name || t('share.noName')}</p>
      <div className="mt-4 flex w-full flex-col gap-2 xs:flex-row">
        <Button variant="default" className="grow xs:basis-0" onClick={() => modals.closeAll()}>{t('common.cancel')}</Button>
        <Button className="grow xs:basis-0" loading={add.isPending} onClick={() => add.mutate({ listId: list.id, data: { userId: user.id } })}>{t('share.addMember')}</Button>
      </div>
    </div>
  );
}
