import { useTranslation } from '@/deprecated/packages/translations';
import {
  SegmentedControl,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react/dist/ssr';

export function ColorThemeToggle() {
  const { t } = useTranslation();
  const { toggleColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('dark');

  return (
    <SegmentedControl
      className="!rounded-none"
      value={colorScheme}
      onChange={() => toggleColorScheme()}
      size="md"
      data={[
        {
          label: (
            <div className="gap-xs flex items-center justify-center">
              <MoonStarsIcon
                className="text-blue-800 dark:text-blue-300"
                size="1.125rem"
                weight="bold"
              />
              {t({ pt: 'Tema escuro', en: 'Dark theme', es: 'Tema oscuro' })}
            </div>
          ),
          value: 'dark',
        },
        {
          label: (
            <div className="gap-xs flex items-center justify-center">
              <SunIcon
                className="text-yellow-800 dark:text-yellow-400"
                size="1.125rem"
                weight="bold"
              />
              {t({ pt: 'Tema claro', en: 'Light theme', es: 'Tema claro' })}
            </div>
          ),
          value: 'light',
        },
      ]}
    />
  );
}
