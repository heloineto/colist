'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import 'dayjs/locale/pt-br';
import type { DatesProviderSettings } from '@mantine/dates';
import { DatesProvider } from '@mantine/dates';
import { useEffect, useMemo, type ReactNode } from 'react';
import { locale } from 'dayjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  type SupportedLanguage,
  TranslationProvider,
} from '@information-systems/translations';
import { ModalsProvider } from '@mantine/modals';
import {
  createQueryClient,
  DeleteContextModal,
  theme as defaultTheme,
} from '@information-systems/mantine';
import {
  createTheme,
  MantineProvider,
  mergeThemeOverrides,
} from '@mantine/core';
import { useCookie } from '@/hooks/use-cookie';
import { PrimaryColorProvider } from '@/contexts/primary-color-context';
import { FeedbackContextModal } from '@/components/feedback-modal/components/feedback-context-modal';
import { Notifications } from '@/components/notifications';

const queryClient = createQueryClient();

const modals = {
  delete: DeleteContextModal,
  feedback: FeedbackContextModal,
};

locale('pt-br');
const languageToLocale: Record<SupportedLanguage, string> = {
  pt: 'pt-br',
  en: 'en',
  es: 'es',
};

interface Props {
  children: ReactNode;
  language: SupportedLanguage;
  primaryColor: string;
}

export function Providers({
  children,
  language: defaultLanguage,
  primaryColor: defaultPrimaryColor,
}: Props) {
  const [language, setLanguage] = useCookie({
    key: 'language',
    defaultValue: defaultLanguage,
    deserialize: (value) => value as SupportedLanguage,
    serialize: (value) => value,
    expires: 365,
  });

  const [primaryColor, setPrimaryColor] = useCookie({
    key: 'primary-color',
    defaultValue: defaultPrimaryColor,
    deserialize: (value) => value as string,
    serialize: (value) => value,
    expires: 365,
  });

  useEffect(() => {
    locale(languageToLocale[language]);
  }, [language]);

  const datesSettings: DatesProviderSettings = useMemo(
    () => ({
      locale: languageToLocale[language],
      firstDayOfWeek: 0,
      weekendDays: [0, 6],
      timezone: 'America/Sao_Paulo',
    }),
    [language]
  );

  const theme = useMemo(
    () =>
      mergeThemeOverrides(
        defaultTheme,
        createTheme({ primaryColor, primaryShade: 8 })
      ),
    [primaryColor]
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <TranslationProvider language={language} setLanguage={setLanguage}>
        <QueryClientProvider client={queryClient}>
          <DatesProvider settings={datesSettings}>
            <PrimaryColorProvider value={{ primaryColor, setPrimaryColor }}>
              <ModalsProvider modals={modals}>
                <Notifications />
                {children}
                <div className="absolute hidden">
                  <ReactQueryDevtools buttonPosition="top-left" />
                </div>
              </ModalsProvider>
            </PrimaryColorProvider>
          </DatesProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </MantineProvider>
  );
}
