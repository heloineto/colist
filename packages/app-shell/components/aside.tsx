import type { AppShellAsideProps, DrawerProps } from '@mantine/core';
import {
  Drawer,
  AppShellAside as MantineAppShellAside,
  useMatches,
} from '@mantine/core';
import type { Disclosure } from '@/packages/mantine';
import type { ReactNode } from 'react';
import { createContext, useEffect, useContext, useState } from 'react';
import { useDisclosure } from '@/packages/mantine';

export interface AsideProps {
  children: ReactNode;
  asideProps?: AppShellAsideProps;
  drawerProps?: Partial<DrawerProps>;
  breakpoint?: string;
}

export function Aside({
  children,
  breakpoint,
  asideProps,
  drawerProps,
}: AsideProps) {
  const { disclosure, setHasAside } = useAside();

  useEffect(() => {
    setHasAside(true);
    return () => setHasAside(false);
  }, [setHasAside]);

  const machesMobile = useMatches({
    base: true,
    [breakpoint ?? '']: false,
  });

  const isMobile = !!breakpoint && machesMobile;

  if (isMobile) {
    return (
      <Drawer
        opened={disclosure.opened}
        onClose={disclosure.close}
        padding={0}
        withCloseButton={false}
        position="right"
        {...drawerProps}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <MantineAppShellAside {...asideProps}>{children}</MantineAppShellAside>
  );
}

const AsideContext = createContext<{
  disclosure: Disclosure;
  hasAside: boolean;
  setHasAside: (hasAside: boolean) => void;
} | null>(null);

export const useAside = () => {
  const context = useContext(AsideContext);
  if (!context) {
    throw new Error('useAside must be used within a AsideProvider');
  }
  return context;
};

export function AsideProvider({ children }: { children: ReactNode }) {
  const disclosure = useDisclosure();
  const [hasAside, setHasAside] = useState(false);

  return (
    <AsideContext.Provider value={{ disclosure, hasAside, setHasAside }}>
      {children}
    </AsideContext.Provider>
  );
}
