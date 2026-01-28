import { createServerClient as originalCreateServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { getEnv } from './get-env';

export function createServerClient<Database>(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  const supabaseUrl = getEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = getEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return originalCreateServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Partial<ResponseCookie>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (_error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: Partial<ResponseCookie>) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (_error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
