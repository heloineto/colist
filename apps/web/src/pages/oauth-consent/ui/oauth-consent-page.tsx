import { Avatar, Button, Paper, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckIcon, PlugsConnectedIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authClient, fetchOAuthClient, hostOf } from '@/shared/api/auth-client';

type Choice = 'allow' | 'deny';

/** better-auth sends users here mid-authorize with a signed query; consent redirects back to the app. */
export function OAuthConsentPage() {
  const { t } = useTranslation();
  const query = new URLSearchParams(window.location.search);
  const clientId = query.get('client_id') ?? '';
  const client = useQuery({
    queryKey: ['oauth-client', clientId],
    queryFn: () => fetchOAuthClient(clientId),
  });
  const [choice, setChoice] = useState<Choice | null>(null);

  const respond = async (accept: boolean) => {
    setChoice(accept ? 'allow' : 'deny');
    const { error } = await authClient.oauth2.consent({ accept });
    if (!error) return; // better-auth's client follows the redirect
    setChoice(null);
    notifications.show({ color: 'red', message: t('errors.unexpected') });
  };

  return (
    <main className="dark:bg-dark-900 flex min-h-dvh flex-col items-center justify-center bg-gray-50 p-4">
      <Paper
        withBorder
        shadow="md"
        radius="md"
        className="flex w-full max-w-[370px] flex-col items-center gap-4 p-[25px] text-center"
      >
        <div className="flex items-center gap-3">
          <Avatar size="lg" radius="md" src="/logo.svg" />
          <PlugsConnectedIcon size="1.5rem" className="text-dimmed" />
          <Avatar size="lg" radius="md" src={client.data?.logo}>
            <PlugsConnectedIcon size="1.5rem" />
          </Avatar>
        </div>
        {client.data ? (
          <div>
            <h1 className="text-xl font-bold text-balance">
              {t('oauth.title', { name: client.data.name })}
            </h1>
            <p className="text-dimmed text-sm">{client.data.host}</p>
          </div>
        ) : (
          <Skeleton h={48} />
        )}
        <p className="flex items-center gap-2 font-medium">
          <CheckIcon size="1.125rem" weight="bold" className="text-primary" />
          {t('oauth.grants')}
        </p>
        <p className="text-dimmed text-sm">
          {t('oauth.redirect', { host: hostOf(query.get('redirect_uri')) })}
        </p>
        <div className="flex w-full gap-3">
          <Button
            variant="default"
            className="grow"
            loading={choice === 'deny'}
            disabled={choice === 'allow'}
            onClick={() => void respond(false)}
          >
            {t('oauth.deny')}
          </Button>
          <Button
            className="grow"
            loading={choice === 'allow'}
            disabled={client.data === undefined || choice === 'deny'}
            onClick={() => void respond(true)}
          >
            {t('oauth.allow')}
          </Button>
        </div>
      </Paper>
    </main>
  );
}
