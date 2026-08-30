import { Divider } from '@mantine/core';
import type { ReactNode } from 'react';

export function ModalHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-3 p-4">
        <span className="bg-primary-light text-primary-light-color flex size-10 shrink-0 items-center justify-center rounded-md [&_svg]:size-5">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          {description && (
            <p className="text-dimmed truncate text-sm">{description}</p>
          )}
        </div>
      </div>
      <Divider />
    </>
  );
}
