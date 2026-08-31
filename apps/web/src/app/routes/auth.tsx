import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@/pages/auth';
import { safeSession } from '@/shared/api/auth-client';

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const { data } = await safeSession();
    if (data) throw redirect({ to: '/app' });
  },
  component: AuthPage,
});
