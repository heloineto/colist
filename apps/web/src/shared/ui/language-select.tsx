import { Select } from '@mantine/core';
import { TranslateIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/shared/i18n';

export function LanguageSelect({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();

  return (
    <Select
      variant="unstyled"
      size="md"
      allowDeselect={false}
      className={className}
      leftSectionWidth={29}
      leftSection={<TranslateIcon size="1.125rem" weight="bold" />}
      value={i18n.resolvedLanguage}
      onChange={(language) => language && void i18n.changeLanguage(language)}
      data={SUPPORTED_LANGUAGES.map((language) => ({
        value: language,
        label: t(`language.${language}`),
      }))}
    />
  );
}
