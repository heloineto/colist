import { Button } from '@mantine/core';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reportCrash } from '@/shared/lib/crash-report';

export function CrashScreen({ error }: ErrorComponentProps) {
  const { t } = useTranslation();
  useEffect(() => {
    reportCrash(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4">
      <h3 className="m-0 text-xl font-bold">{t('errors.crashTitle')}</h3>
      <p className="text-dimmed m-0 text-center">
        {t('errors.crashDescription')}
      </p>
      <Button
        mt="md"
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('errors.reload')}
      </Button>
    </div>
  );
}
