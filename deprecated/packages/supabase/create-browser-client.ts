import { createBrowserClient as originalCreateBrowserClient } from '@supabase/ssr';
import { getEnv } from './get-env';

export function createBrowserClient<Database>() {
  const supabaseUrl = getEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = getEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return originalCreateBrowserClient<Database>(supabaseUrl, supabaseKey);
}
