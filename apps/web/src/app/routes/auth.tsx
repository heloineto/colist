import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@/pages/auth';
import { authClient } from '@/shared/auth';

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) throw redirect({ to: '/app' });
  },
  component: AuthPage,
});
