import { useTranslation } from '@information-systems/translations';
import {
  SegmentedControl,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { MoonStars, Sun } from '@phosphor-icons/react/dist/ssr';

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
            <div className="flex items-center justify-center gap-xs">
              <MoonStars
                className="text-blue-8 dark:text-blue-3"
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
            <div className="flex items-center justify-center gap-xs">
              <Sun
                className="text-yellow-8 dark:text-yellow-4"
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
