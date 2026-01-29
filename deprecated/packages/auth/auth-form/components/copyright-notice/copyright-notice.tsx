import { useTranslation } from '@/deprecated/packages/translations';
import { ColorSchemeToggle } from '../color-scheme-toggle';
import { LanguagePicker } from '../language-picker';
import classes from './copyright-notice.module.css';

export interface CopyrightNoticeProps {
  languagePicker?: boolean;
}

export function CopyrightNotice({
  languagePicker = true,
}: CopyrightNoticeProps) {
  const { t } = useTranslation();

  return (
    <div className={classes.copyrightNotice}>
      <span>
        &copy; {new Date().getFullYear()}{' '}
        {t({
          pt: 'Todos os direitos reservados.',
          en: 'All rights reserved.',
          es: 'Todos los derechos reservados.',
        })}
      </span>
      <span className={classes.firstBullet}>&bull;</span>
      <span className={classes.optionsWrapper}>
        <ColorSchemeToggle />
        {languagePicker ? (
          <>
            <span>&bull;</span>
            <LanguagePicker />
          </>
        ) : null}
      </span>
    </div>
  );
}
