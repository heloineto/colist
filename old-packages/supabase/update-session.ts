import { createServerClient } from '@supabase/ssr';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { getEnv } from './get-env';

export async function updateSession<Database>(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = getEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = getEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Partial<ResponseCookie>) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: Partial<ResponseCookie>) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  let user;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (_error) {
    user = null;
  }

  return { response, user };
}
