import {
  Checkbox,
  createTheme,
  HoverCard,
  type MantineThemeOverride,
  Modal,
  Tooltip,
} from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  fontFamily: 'var(--font-geist-sans)',
  fontFamilyMonospace: 'var(--font-geist-mono)',
  defaultRadius: 'md',
  components: {
    Modal: Modal.extend({
      defaultProps: { centered: true },
      styles: { title: { fontWeight: 700 } },
    }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true } }),
    HoverCard: HoverCard.extend({ defaultProps: { withArrow: true } }),
    Checkbox: Checkbox.extend({
      defaultProps: { radius: '0.375rem' },
    }),
  },
});
