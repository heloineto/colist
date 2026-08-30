import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({ basePath: '/api/auth' });

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
