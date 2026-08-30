import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toAuthErrorCode } from '@/shared/auth';

type AuthResult = { error: { code?: string } | null };

/** Runs a better-auth call, toasts its error code, navigates to /app on success. */
export function useAuthSubmit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function submit(call: () => Promise<AuthResult>) {
    setLoading(true);
    const { error } = await call().finally(() => setLoading(false));
    if (!error) {
      await navigate({ to: '/app' });
      return;
    }
    const code = toAuthErrorCode(error.code);
    notifications.show({
      color: 'red',
      message: t(code ? `auth.errors.${code}` : 'auth.errors.generic'),
    });
  }

  return { submit, loading };
}
