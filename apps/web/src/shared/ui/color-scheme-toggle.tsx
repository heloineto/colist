import { SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { CircleHalfIcon, MoonStarsIcon, SunIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export function ColorSchemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      className={className}
      size="md"
      value={colorScheme}
      onChange={(value) => setColorScheme(value)}
      data={[
        {
          value: 'light',
          label: (
            <span className="flex items-center justify-center gap-1">
              <SunIcon
                size="1.125rem"
                weight="bold"
                className="text-yellow-800 dark:text-yellow-400"
              />
              {t('profile.themeLight')}
            </span>
          ),
        },
        {
          value: 'auto',
          label: (
            <span className="flex items-center justify-center gap-1">
              <CircleHalfIcon
                size="1.125rem"
                weight="bold"
                className="dark:text-dark-100 text-gray-600"
              />
              Auto
            </span>
          ),
        },
        {
          value: 'dark',
          label: (
            <span className="flex items-center justify-center gap-1">
              <MoonStarsIcon
                size="1.125rem"
                weight="bold"
                className="text-blue-800 dark:text-blue-300"
              />
              {t('profile.themeDark')}
            </span>
          ),
        },
      ]}
    />
  );
}
