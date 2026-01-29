import { Anchor, useMantineColorScheme } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react/dist/ssr';
import classes from './color-scheme-toggle.module.css';

export function ColorSchemeToggle() {
  const { toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  return (
    <Anchor
      className={classes.colorSchemeToggle}
      component="button"
      type="button"
      onClick={toggleColorScheme}
    >
      <SunIcon className={classes.darkHidden} weight="bold" />
      <MoonStarsIcon className={classes.lightHidden} weight="bold" />
      <span className={classes.darkHidden}>
        {t({ pt: 'Modo claro', en: 'Light mode', es: 'Modo claro' })}
      </span>
      <span className={classes.lightHidden}>
        {t({ pt: 'Modo escuro', en: 'Dark mode', es: 'Modo oscuro' })}
      </span>
    </Anchor>
  );
}
