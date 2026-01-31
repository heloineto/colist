import { Skeleton } from '@mantine/core';
import classes from './sidebar.module.css';
import { AvatarLoading } from '@/packages/states';

export function SidebarUserLoading() {
  return (
    <div className={classes.userNavButtonLoading}>
      <AvatarLoading />
      <div className="flex grow flex-col justify-between">
        <Skeleton h={12} my={4} w="60%" />
        <Skeleton h={10} my={4} w="90%" />
      </div>
    </div>
  );
}
