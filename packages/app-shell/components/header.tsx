import { Burger, UnstyledButton } from '@mantine/core';
import type { ReactNode } from 'react';
import { FunnelIcon } from '@phosphor-icons/react/dist/ssr';
import { useSidebar } from './sidebar';
import { useAside } from './aside';

export function Header({
  leftSection,
  rightSection,
  sidebarBreakpoint,
  asideBreakpoint,
}: {
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  sidebarBreakpoint?: string;
  asideBreakpoint?: string;
}) {
  const { disclosure: sidebarDisclosure } = useSidebar();
  const { disclosure: asideDisclosure, hasAside } = useAside();

  return (
    <>
      <div className="flex items-center gap-3">
        <Burger
          opened={sidebarDisclosure.opened}
          onClick={sidebarDisclosure.toggle}
          hiddenFrom={sidebarBreakpoint}
          size="sm"
        />
        {leftSection}
      </div>
      <div className="flex items-center gap-3">
        {rightSection}
        {hasAside && (
          <UnstyledButton
            size={28}
            variant="transparent"
            hiddenFrom={asideBreakpoint}
            onClick={asideDisclosure.toggle}
          >
            <FunnelIcon className="text-gray-8 dark:text-dark-0 size-6" />
          </UnstyledButton>
        )}
      </div>
    </>
  );
}
