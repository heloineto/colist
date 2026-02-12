import { useTranslation } from '@/deprecated/packages/translations';
import { LOGIN_ROUTE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { Loader, NavLink } from '@mantine/core';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    // TODO: Add posthog and then uncomment the line below
    // posthog.reset(true);
    router.push(LOGIN_ROUTE);
  };

  return (
    <NavLink
      label={t({ en: 'Log out', pt: 'Sair da conta', es: 'Cerrar sesión' })}
      leftSection={
        loading ? (
          <Loader size="1.125rem" />
        ) : (
          <SignOutIcon
            size="1.125rem"
            className="dark:text-dark-50 text-gray-600"
            weight="bold"
          />
        )
      }
      variant="subtle"
      classNames={{
        root: 'bg-gray-50 dark:bg-dark-700 data-[active]:hover:bg-gray-100 dark:data-[active]:hover:bg-dark-800 !px-md',
        label: 'text-gray-900 dark:text-dark-50 !text-md',
      }}
      active
      onClick={() => {
        setLoading(true);
        onSignOut();
        setTimeout(() => setLoading(false), 1000);
      }}
    />
  );
}
