import { type SupportedLanguage, useTranslation } from './translation-context';

export function Translate(props: Record<SupportedLanguage, string>) {
  const { t } = useTranslation();
  return t(props);
}
