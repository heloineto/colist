import {
  type TFunction,
  useTranslation,
} from '@/deprecated/packages/translations';
import { type ComponentProps } from 'react';
import classes from './no-name.module.css';

/**
 * Get the translation for the message "No name".
 * @param t - The translation function, returned by `useTranslation`.
 */
export function getNoName(t: TFunction) {
  return t({ pt: 'Sem nome', en: 'No name', es: 'Sin nombre' });
}

export function NoName({ className, ...rest }: ComponentProps<'span'>) {
  const { t } = useTranslation();

  return (
    <span
      className={className ? `${className} ${classes.root}` : classes.root}
      {...rest}
    >
      {getNoName(t)}
    </span>
  );
}
