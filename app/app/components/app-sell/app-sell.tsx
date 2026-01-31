'use client';

import {
  AppShell as MantineAppShell,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  ScrollArea,
} from '@mantine/core';
import type { ReactNode } from 'react';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { FOOTER_HEIGHT, HEADER_HEIGHT } from './utils/constants';

export const MAIN_HEIGHT =
  'calc(100dvh - var(--app-shell-header-offset) - var(--app-shell-footer-offset))';

interface Props {
  children: ReactNode;
}

export function AppSell({ children }: Props) {
  return (
    <MantineAppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: 52,
        breakpoint: 'sm',
        collapsed: { desktop: false, mobile: true },
      }}
      footer={{ height: { base: FOOTER_HEIGHT, sm: 0 } }}
      transitionDuration={0}
    >
      <AppShellHeader withBorder={false}>
        <Header />
      </AppShellHeader>
      <AppShellNavbar className="relative" withBorder={false} px={4}>
        <Navbar />
      </AppShellNavbar>
      <AppShellMain className="flex">
        <ScrollArea h={MAIN_HEIGHT} w="100%">
          <div className="flex flex-col" style={{ height: MAIN_HEIGHT }}>
            {children}
          </div>
        </ScrollArea>
      </AppShellMain>
      <AppShellFooter withBorder={false} hiddenFrom="sm">
        <Footer />
      </AppShellFooter>
    </MantineAppShell>
  );
}
