import { Button, SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/shared/i18n';

export function HomePage() {
  const { t, i18n } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">{t('hello')}</h1>
      <SegmentedControl
        value={i18n.resolvedLanguage}
        data={[...SUPPORTED_LANGUAGES]}
        onChange={(language) => void i18n.changeLanguage(language)}
      />
      <Button>{t('hello')}</Button>
      <p className="text-sm text-gray-500">
        {import.meta.env.VITE_APP_VERSION}
      </p>
    </main>
  );
}
