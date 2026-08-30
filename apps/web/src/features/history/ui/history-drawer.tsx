import { Button, Drawer, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { UserAvatar } from '@/entities/user';
import { useHistory } from '@/features/history/model/history-context';
import {
  activities,
  getActivitiesQueryKey,
} from '@/shared/api/generated/activities/activities';
import { relativeTime } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/empty-state';

const PAGE = 50;

function Activities({ listId }: { listId: number }) {
  const { t } = useTranslation();
  const query = useInfiniteQuery({
    queryKey: [...getActivitiesQueryKey(listId), 'infinite'],
    queryFn: ({ pageParam }) =>
      activities(listId, {
        limit: PAGE,
        ...(pageParam ? { before: pageParam } : {}),
      }),
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.length < PAGE ? undefined : last.at(-1)?.id,
  });
  const rows = query.data?.pages.flat();

  if (!rows)
    return [1, 2, 3, 4, 5].map((row) => (
      <div key={row} className="flex items-center gap-3 py-2">
        <Skeleton circle h={32} w={32} />
        <Skeleton h={14} w={180 + (row % 3) * 30} />
      </div>
    ));
  if (rows.length === 0)
    return (
      <EmptyState
        size="sm"
        icon={ClockCounterClockwiseIcon}
        title={t('history.empty.title')}
        description={t('history.empty.description')}
      />
    );

  return (
    <div className="flex flex-col gap-1">
      {rows.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 py-2">
          <UserAvatar name={activity.actorName} image={null} size="sm" />
          <div className="min-w-0">
            <p className="text-sm">
              {t(`activity.${activity.action}`, {
                actorName: activity.actorName,
                targetName: activity.targetName ?? '',
              })}
            </p>
            <p className="text-dimmed text-xs">
              {relativeTime(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
      {query.hasNextPage && (
        <Button
          variant="subtle"
          size="xs"
          loading={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {t('common.loadMore')}
        </Button>
      )}
    </div>
  );
}

export function HistoryDrawer() {
  const { t } = useTranslation();
  const { opened, close } = useHistory();
  const { listId } = useSelectedList();
  const isDesktop = useMediaQuery('(min-width: 48em)');

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position={isDesktop ? 'right' : 'bottom'}
      size={isDesktop ? 'md' : '70%'}
      title={t('history.title')}
      classNames={{ content: isDesktop ? '' : 'rounded-t-lg!' }}
    >
      {listId !== null && opened && <Activities listId={listId} />}
    </Drawer>
  );
}
