import { ModalCloseButton } from '@mantine/core';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { TitleCard } from '../title-card';

interface Props extends ComponentProps<'header'> {
  title: string;
  description: string;
  icon: ReactNode;
}

export function ModalHeader({
  title,
  description,
  icon,
  className,
  ...rest
}: Props) {
  return (
    <header className={clsx('flex gap-sm pt-md', className)} {...rest}>
      <TitleCard description={description} icon={icon} title={title} />
      <ModalCloseButton className="-mr-1.5 -mt-1.5 ml-auto !text-dimmed" />
    </header>
  );
}
