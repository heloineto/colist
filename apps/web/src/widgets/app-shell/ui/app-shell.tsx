import { AppShell as MantineAppShell, ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';
import { Footer } from '@/widgets/app-shell/ui/footer';
import { Header } from '@/widgets/app-shell/ui/header';
import { Navbar } from '@/widgets/app-shell/ui/navbar';

const HEADER = '6rem';
const FOOTER = '3.75rem';
const MAIN = 'calc(100dvh - var(--app-shell-header-offset, 0px) - var(--app-shell-footer-offset, 0px))';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MantineAppShell
      header={{ height: HEADER }}
      navbar={{ width: 52, breakpoint: 'sm', collapsed: { desktop: false, mobile: true } }}
      footer={{ height: { base: FOOTER, sm: 0 } }}
      transitionDuration={0}
    >
      <MantineAppShell.Header withBorder={false}>
        <Header />
      </MantineAppShell.Header>
      <MantineAppShell.Navbar withBorder={false}>
        <Navbar />
      </MantineAppShell.Navbar>
      <MantineAppShell.Main className="flex">
        <ScrollArea h={MAIN} w="100%">
          <div className="flex flex-col" style={{ height: MAIN }}>
            {children}
          </div>
        </ScrollArea>
      </MantineAppShell.Main>
      <MantineAppShell.Footer withBorder={false} hiddenFrom="sm">
        <Footer />
      </MantineAppShell.Footer>
    </MantineAppShell>
  );
}
