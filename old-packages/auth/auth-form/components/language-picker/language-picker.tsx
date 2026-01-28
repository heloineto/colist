import { useTranslation } from '@information-systems/translations';
import {
  Anchor,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
} from '@mantine/core';
import { Translate } from '@phosphor-icons/react/dist/ssr';
import classes from './language-picker.module.css';

export function LanguagePicker() {
  const { setLanguage, t } = useTranslation();

  return (
    <Menu trigger="hover" openDelay={100} closeDelay={400}>
      <MenuTarget>
        <Anchor
          className={classes.languagePicker}
          component="button"
          type="button"
        >
          <Translate weight="bold" />
          {t({ pt: 'Português', en: 'English', es: 'Español' })}
        </Anchor>
      </MenuTarget>
      <MenuDropdown>
        <MenuItem onClick={() => setLanguage('pt')}>Português</MenuItem>
        <MenuItem onClick={() => setLanguage('en')}>English</MenuItem>
        <MenuItem onClick={() => setLanguage('es')}>Español</MenuItem>
      </MenuDropdown>
    </Menu>
  );
}
