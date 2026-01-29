export function translate(
  translations: Record<'pt' | 'en' | 'es', string>,
  language: 'pt' | 'en' | 'es' | ({} & string)
) {
  return language in translations
    ? translations[language as 'pt' | 'en' | 'es']
    : translations.pt;
}
