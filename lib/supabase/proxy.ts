import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  DEFAULT_ROUTE,
  LANDING_PAGE_ROUTE,
  LOGIN_ROUTE,
  PUBLIC_ROUTES,
} from '../constants';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const redirectRoute = getRedirectRoute(request, !!user);

  if (redirectRoute) {
    const url = request.nextUrl.clone();
    url.pathname = redirectRoute;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

function getRedirectRoute(
  request: NextRequest,
  isAuthenticated: boolean
): string | null {
  if (!isAuthenticated) {
    if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      return null;
    }

    return LOGIN_ROUTE;
  }

  // NOTE: If arrived to the landing page from a referer (Ex: Google), don't redirect
  if (request.nextUrl.pathname === LANDING_PAGE_ROUTE) {
    const referer = request.headers.get('referer');

    if (referer) {
      return null;
    }

    return DEFAULT_ROUTE;
  }

  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return DEFAULT_ROUTE;
  }

  return null;
}
