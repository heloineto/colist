import {
  Checkbox,
  HoverCard,
  MantineProvider,
  Modal,
  Tooltip,
  createTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { queryClient } from '@/shared/api/query-client';
import { usePrimaryColor } from '@/shared/lib/preferences';

const baseTheme = createTheme({
  defaultRadius: 'md',
  primaryShade: 8,
  components: {
    Modal: Modal.extend({
      defaultProps: { centered: true },
      styles: { title: { fontWeight: 700 } },
    }),
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
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications position={isDesktop ? undefined : 'bottom-center'} />
          {children}
        </ModalsProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </MantineProvider>
  );
}
