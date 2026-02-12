import { Select } from '@mantine/core';
import { TranslateIcon } from '@phosphor-icons/react/dist/ssr';
import type { SupportedLanguage } from '@/deprecated/packages/translations';
import { useTranslation } from '@/deprecated/packages/translations';

export function LanguageSelect() {
  const { language, setLanguage } = useTranslation();

  return (
    <Select
      className="px-md hover:dark:bg-dark-800 pt-0.5 hover:bg-gray-100"
      value={language}
      onChange={(value) =>
        setLanguage((value as SupportedLanguage | null) ?? 'pt')
      }
      size="md"
      placeholder="Language"
      variant="unstyled"
      data={[
        { value: 'pt', label: 'Português' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
      ]}
      leftSectionWidth={29}
      leftSectionProps={{ className: '!justify-start' }}
      leftSection={
        <TranslateIcon
          size="1.125rem"
          className="dark:text-dark-50 text-gray-600"
          weight="bold"
        />
      }
    />
  );
}
