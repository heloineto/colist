import { Anchor, Menu, useMantineColorScheme } from '@mantine/core';
import { MoonIcon, SunIcon, TranslateIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/shared/i18n';

export function AuthFooter() {
  const { t, i18n } = useTranslation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 p-4 text-sm text-dimmed">
      <span className="hidden xs:inline">
        © {new Date().getFullYear()} {t('auth.copyright')}
      </span>
      <Anchor component="button" size="sm" className="flex items-center gap-1" onClick={toggleColorScheme}>
        {dark ? <SunIcon size="1rem" /> : <MoonIcon size="1rem" />}
        {dark ? t('auth.lightMode') : t('auth.darkMode')}
      </Anchor>
      <Menu trigger="hover" openDelay={100} closeDelay={400}>
        <Menu.Target>
          <Anchor component="button" size="sm" className="flex items-center gap-1">
            <TranslateIcon size="1rem" />
            {t(`language.${i18n.resolvedLanguage as 'pt'}`)}
          </Anchor>
        </Menu.Target>
        <Menu.Dropdown>
          {SUPPORTED_LANGUAGES.map((language) => (
            <Menu.Item key={language} onClick={() => void i18n.changeLanguage(language)}>
              {t(`language.${language}`)}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </footer>
  );
}
