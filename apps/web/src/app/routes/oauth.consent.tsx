import { createFileRoute, redirect } from '@tanstack/react-router';
import { OAuthConsentPage } from '@/pages/oauth-consent';
import { safeSession } from '@/shared/api/auth-client';

export const Route = createFileRoute('/oauth/consent')({
  beforeLoad: async () => {
    const { data } = await safeSession();
    // Keep the signed query: signing in on /auth resumes the authorization.
    if (!data) throw redirect({ href: `/auth${window.location.search}` });
  },
  component: OAuthConsentPage,
});
