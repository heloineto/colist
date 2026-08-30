import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { safeSession } from '@/shared/api/auth-client';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const { data, offline } = await safeSession();
    // A network failure can't prove the session is gone — keep the cached UI.
    if (!data && !offline) throw redirect({ to: '/auth' });
    return { user: data?.user ?? null };
  },
  component: Outlet,
});
