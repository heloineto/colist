import { oauthProviderClient } from '@better-auth/oauth-provider/client';
import { createAuthClient } from 'better-auth/react';

/** `oauthProviderClient` forwards the signed OAuth query, so sign-in resumes an MCP authorization. */
export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [oauthProviderClient()],
});

/** On `/auth` mid-OAuth (signed query): better-auth redirects on its own after sign-in. */
export function isOAuthFlow() {
  return new URLSearchParams(window.location.search).has('sig');
}

/** A Connected app's display info. `client_name` is self-asserted; its `client_id` host isn't. */
export async function fetchOAuthClient(clientId: string) {
  const { data, error } = await authClient.oauth2.publicClient({
    query: { client_id: clientId },
  });
  if (error) throw new Error(error.message);
  return {
    name: data.client_name ?? hostOf(clientId),
    host: hostOf(clientId),
    logo: data.logo_uri ?? null,
  };
}

export function hostOf(url: string | null) {
  return URL.parse(url ?? '')?.host ?? '';
}

/** better-auth error codes the auth forms can surface; anything else → generic. */
export const AUTH_ERROR_CODES = [
  'INVALID_EMAIL_OR_PASSWORD',
  'USER_ALREADY_EXISTS',
  'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
  'INVALID_EMAIL',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_TOO_LONG',
] as const;
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export function toAuthErrorCode(
  code: string | undefined
): AuthErrorCode | null {
  return AUTH_ERROR_CODES.find((known) => known === code) ?? null;
}

/** `getSession`, flagging network failure so offline isn't read as signed-out. */
export async function safeSession() {
  try {
    const { data } = await authClient.getSession();
    return { data, offline: false };
  } catch {
    return { data: null, offline: true };
  }
}
