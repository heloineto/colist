import { Avatar, Button, Divider } from '@mantine/core';
import { PlugsConnectedIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authClient, fetchOAuthClient } from '@/shared/api/auth-client';
import { useConnectedAppsDisconnect } from '@/shared/api/generated/connected-apps/connected-apps';
import { queryClient } from '@/shared/api/query-client';
import { relativeTime } from '@/shared/lib/format';
import { confirm } from '@/shared/ui/confirm';

const CONNECTED_APPS_KEY = ['connected-apps'];

/** better-auth's own consent list, joined with each client's public info. */
async function fetchConnectedApps() {
  const { data, error } = await authClient.oauth2.getConsents();
  if (error) throw new Error(error.message);
  return Promise.all(
    data.map(async (consent) => ({
      id: consent.id,
      createdAt: new Date(consent.createdAt).toISOString(),
      ...(await fetchOAuthClient(consent.clientId)),
    }))
  );
}

type ConnectedApp = Awaited<ReturnType<typeof fetchConnectedApps>>[number];

function ConnectedAppRow({ app }: { app: ConnectedApp }) {
  const { t } = useTranslation();
  const disconnect = useConnectedAppsDisconnect({
    mutation: {
      meta: { success: t('profile.connectedApps.disconnected') },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: CONNECTED_APPS_KEY }),
    },
  });

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Avatar radius="md" src={app.logo}>
        <PlugsConnectedIcon size="1.25rem" />
      </Avatar>
      <div className="min-w-0 grow">
        <p className="truncate font-medium">{app.name}</p>
        <p className="text-dimmed truncate text-sm">
          {t('profile.connectedApps.since', {
            when: relativeTime(app.createdAt),
          })}
        </p>
      </div>
      <Button
        size="compact-sm"
        variant="subtle"
        color="red"
        loading={disconnect.isPending}
        onClick={() =>
          confirm({
            title: t('profile.connectedApps.disconnect'),
            message: t('profile.connectedApps.confirmMessage', {
              name: app.name,
            }),
            cancel: t('common.cancel'),
            confirm: t('profile.connectedApps.disconnect'),
            icon: <PlugsConnectedIcon size="1.5rem" />,
            onConfirm: () => disconnect.mutate({ consentId: app.id }),
          })
        }
      >
        {t('profile.connectedApps.disconnect')}
      </Button>
    </div>
  );
}

/** Hidden until the user connects an app (e.g. Claude over MCP). */
export function ConnectedApps() {
  const { t } = useTranslation();
  const apps = useQuery({
    queryKey: CONNECTED_APPS_KEY,
    queryFn: fetchConnectedApps,
  });

  if (apps.data === undefined || apps.data.length === 0) return null;

  return (
    <div className="flex flex-col pb-2">
      <Divider />
      <p className="text-dimmed px-4 pt-3 pb-1 text-sm font-medium">
        {t('profile.connectedApps.title')}
      </p>
      {apps.data.map((app) => (
        <ConnectedAppRow key={app.id} app={app} />
      ))}
    </div>
  );
}
