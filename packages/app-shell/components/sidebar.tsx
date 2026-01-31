'use client';

import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import classes from './sidebar.module.css';
import { cn } from '@/packages/utils';
import type { Disclosure } from '@/packages/mantine';
import { useDisclosure } from '@/packages/mantine';
import { Drawer, useMatches } from '@mantine/core';

const DEFAULT_SIDEBAR_COLLAPSED_WIDTH = '3.25rem';
const DEFAULT_SIDEBAR_EXPANDED_WIDTH = '14rem';

export interface SidebarProps extends ComponentProps<'div'> {
  children: ReactNode;
  expanded?: boolean;
  onChangeExpanded?: (expanded: boolean) => void;
  collapsedWidth?: string;
  expandedWidth?: string;
  breakpoint?: string;
  withBorder?: boolean;
}

export function Sidebar({
  children,
  className,
  expanded: expandedProp,
  onChangeExpanded: onChangeProp,
  collapsedWidth = DEFAULT_SIDEBAR_COLLAPSED_WIDTH,
  expandedWidth = DEFAULT_SIDEBAR_EXPANDED_WIDTH,
  breakpoint,
  withBorder = true,
  ...rest
}: SidebarProps) {
  const [expanded, onChangeExpanded] = useUncontrolled({
    defaultValue: false,
    finalValue: false,
    value: expandedProp,
    onChange: onChangeProp,
  });

  const { disclosure } = useSidebar();

  const machesMobile = useMatches({
    base: true,
    [breakpoint ?? '']: false,
  });

  const isMobile = !!breakpoint && machesMobile;

  const content = (
    <div
      className={cn(className, classes.root)}
      data-state={expanded ? 'expanded' : 'collapsed'}
      onMouseEnter={() => onChangeExpanded(true)}
      onMouseLeave={() => onChangeExpanded(false)}
      data-with-border={withBorder}
      style={
        {
          '--sidebar-collapsed-width': collapsedWidth,
          '--sidebar-expanded-width': expandedWidth,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={disclosure.opened}
        onClose={disclosure.close}
        size={expandedWidth}
        padding={0}
        withCloseButton={false}
        position="left"
      >
        {content}
      </Drawer>
    );
  }

  return content;
}

const SidebarContext = createContext<{
  disclosure: Disclosure;
} | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarContext');
  }
  return context;
};

export function SidebarProvider({ children }: { children: ReactNode }) {
  const disclosure = useDisclosure();

  return (
    <SidebarContext.Provider value={{ disclosure }}>
      {children}
    </SidebarContext.Provider>
  );
}
