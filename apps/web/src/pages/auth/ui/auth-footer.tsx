import { Anchor, Menu, useMantineColorScheme } from '@mantine/core';
import { MoonStarsIcon, SunIcon, TranslateIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/shared/i18n';

export function AuthFooter() {
  const { t, i18n } = useTranslation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <footer className="text-dimmed xs:flex-row mb-4 flex flex-col-reverse flex-wrap items-center justify-center gap-1 px-2 text-center text-sm">
      <span>
        © {new Date().getFullYear()} {t('auth.copyright')}
      </span>
      <span className="xs:inline hidden">•</span>
      <span className="inline-flex flex-wrap items-center justify-center gap-1">
        <Anchor
          component="button"
          type="button"
          size="sm"
          className="flex items-center gap-0.5"
          onClick={toggleColorScheme}
        >
          {dark ? (
            <SunIcon size="1rem" weight="bold" />
          ) : (
            <MoonStarsIcon size="1rem" weight="bold" />
          )}
          {dark ? t('auth.lightMode') : t('auth.darkMode')}
        </Anchor>
        <span>•</span>
        <Menu trigger="hover" openDelay={100} closeDelay={400}>
          <Menu.Target>
            <Anchor
              component="button"
              type="button"
              size="sm"
              className="flex items-center gap-0.5"
            >
              <TranslateIcon size="1rem" weight="bold" />
              {t(`language.${i18n.resolvedLanguage as 'pt'}`)}
            </Anchor>
          </Menu.Target>
          <Menu.Dropdown>
            {SUPPORTED_LANGUAGES.map((language) => (
              <Menu.Item
                key={language}
                onClick={() => void i18n.changeLanguage(language)}
              >
                {t(`language.${language}`)}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </span>
    </footer>
  );
}
