'use client';

import type { NotificationsProps } from '@mantine/notifications';
import { Notifications as OriginalNotifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import classes from './notifications.module.css';

export function Notifications(props: NotificationsProps) {
  const isDesktop = useMediaQuery('(min-width: 48em)');

  return (
    <OriginalNotifications
      position={isDesktop ? undefined : 'bottom-center'}
      classNames={classes}
      {...props}
    />
  );
}
