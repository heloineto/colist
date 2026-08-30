import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@/pages/auth';
import { authClient } from '@/shared/api/auth-client';

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) throw redirect({ to: '/app' });
  },
  component: AuthPage,
});
