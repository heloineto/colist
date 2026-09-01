import {
  Checkbox,
  Drawer,
  HoverCard,
  MantineProvider,
  Modal,
  Tooltip,
  createTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import type { ReactNode } from 'react';
import { registerOfflineMutations } from '@/shared/api/offline';
import { CACHE_MAX_AGE, queryClient } from '@/shared/api/query-client';
import { usePrimaryColor } from '@/shared/lib/preferences';

registerOfflineMutations(queryClient);

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => get<string>(key),
    setItem: (key: string, value: string) => set(key, value),
    removeItem: (key: string) => del(key),
  },
});

// Programmatic focus inside a portaled Modal freezes touch scrolling on iOS
// (mantine#8847, #8928); touch devices get no autofocus in modals.
const coarsePointer = matchMedia('(pointer: coarse)').matches;

// Overlays end at the iOS keyboard instead of behind it (trackKeyboardInset).
const aboveKeyboard = { bottom: 'var(--keyboard-inset, 0px)' };

const baseTheme = createTheme({
  fontFamily: "'Geist Variable', sans-serif",
  fontFamilyMonospace: "'Geist Mono Variable', monospace",
  defaultRadius: 'md',
  primaryShade: 8,
  components: {
    Modal: Modal.extend({
      defaultProps: { centered: true, trapFocus: !coarsePointer },
      styles: { title: { fontWeight: 700 }, inner: aboveKeyboard },
    }),
    Drawer: Drawer.extend({ styles: { inner: aboveKeyboard } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true } }),
    HoverCard: HoverCard.extend({ defaultProps: { withArrow: true } }),
    Checkbox: Checkbox.extend({ defaultProps: { radius: '0.375rem' } }),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [primaryColor] = usePrimaryColor();
  const isDesktop = useMediaQuery('(min-width: 48em)');

  return (
    <MantineProvider
      theme={{ ...baseTheme, primaryColor }}
      defaultColorScheme="auto"
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: CACHE_MAX_AGE,
          buster: import.meta.env.VITE_APP_VERSION ?? 'dev',
        }}
        onSuccess={() => {
          // reload-resume of the offline queue + blanket invalidate (ticket 09)
          void queryClient
            .resumePausedMutations()
            .then(() => queryClient.invalidateQueries());
        }}
      >
        <ModalsProvider>
          <Notifications position={isDesktop ? undefined : 'bottom-center'} />
          {children}
        </ModalsProvider>
        <ReactQueryDevtools />
      </PersistQueryClientProvider>
    </MantineProvider>
  );
}
