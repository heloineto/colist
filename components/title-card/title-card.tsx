import { Text, Title } from '@mantine/core';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

export interface TitleCardProps extends ComponentProps<'div'> {
  title: string;
  description: string;
  icon: ReactNode;
}

export function TitleCard({
  title,
  description,
  icon,
  className,
  ...rest
}: TitleCardProps) {
  return (
    <div className={clsx('flex gap-sm', className)} {...rest}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-light text-[1.5rem] text-gray-light-color">
        {icon}
      </div>
      <div className="flex flex-col">
        <Title className="" order={2} size="h5" p={0}>
          {title}
        </Title>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </div>
    </div>
  );
}
