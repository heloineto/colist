import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { authClient } from '@/shared/api/auth-client';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: '/auth' });
    return { user: data.user };
  },
  component: Outlet,
});
