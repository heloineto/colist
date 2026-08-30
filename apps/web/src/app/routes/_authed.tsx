import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { authClient } from '@/shared/auth';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: '/auth' });
    return { user: data.user };
  },
  component: Outlet,
});
