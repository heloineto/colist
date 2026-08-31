import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from '@/shared/i18n/locales/en';
import { es } from '@/shared/i18n/locales/es';
import { pt } from '@/shared/i18n/locales/pt';

export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es'] as const;

const HTML_LANG: Partial<Record<string, string>> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es',
};

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'pt',
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

i18next.on('languageChanged', (language) => {
  document.documentElement.lang = HTML_LANG[language] ?? language;
});
