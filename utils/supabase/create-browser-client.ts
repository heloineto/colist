import { getEnv } from '@information-systems/supabase';
import { createBrowserClient as originalCreateBrowserClient } from '@supabase/ssr';
import type { Database } from './database-types';

export function createBrowserClient() {
  const supabaseUrl = getEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = getEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return originalCreateBrowserClient<Database>(supabaseUrl, supabaseKey);
}

export const supabase = createBrowserClient();
