import type { pt } from '@/shared/i18n/locales/pt';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof pt };
  }
}
