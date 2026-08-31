import { Button, Divider } from '@mantine/core';
import { GoogleLogoIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { authClient } from '@/shared/api/auth-client';

export function GoogleButton() {
  const { t } = useTranslation();

  return (
    <>
      <Divider label={t('auth.or')} labelPosition="center" my="sm" />
      <Button
        fullWidth
        variant="default"
        leftSection={<GoogleLogoIcon size="1.125rem" weight="bold" />}
        onClick={() =>
          void authClient.signIn.social({
            provider: 'google',
            callbackURL: `${window.location.origin}/app`,
          })
        }
      >
        {t('auth.google')}
      </Button>
    </>
  );
}
