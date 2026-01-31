'use client';

import type { NavLinkProps } from '@mantine/core';
import { createPolymorphicComponent, NavLink } from '@mantine/core';
import type { Icon } from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import { forwardRef } from 'react';

export type SidebarItemProps = Omit<NavLinkProps, 'active'> & {
  icon?: Icon;
  active?: boolean | ((pathname: string, href?: string) => boolean);
};

const SidebarItem = createPolymorphicComponent<'a', SidebarItemProps>(
  forwardRef<HTMLAnchorElement, SidebarItemProps>(function SidebarItem(
    { icon: Icon, leftSection, active: activeProp, label, ...props },
    ref
  ) {
    const pathname = usePathname();

    let active: boolean;

    if (typeof activeProp === 'function') {
      const href = 'href' in props ? (props.href as string) : undefined;
      active = activeProp(pathname, href);
    } else if (typeof activeProp === 'boolean') {
      active = activeProp;
    } else {
      active = 'href' in props && props.href === pathname;
    }

    return (
      <NavLink
        active={active}
        {...props}
        label={
          typeof label === 'string' ? (
            <span className="text-gray-8 dark:text-dark-1 font-medium">
              {label}
            </span>
          ) : (
            label
          )
        }
        leftSection={
          Icon ? (
            <Icon className="text-gray-9 dark:text-dark-0 size-5" />
          ) : (
            leftSection
          )
        }
        ref={ref}
      />
    );
  })
);

SidebarItem.displayName = 'SidebarItem';

export { SidebarItem };
