import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from './create-server-client';

export async function signOut(redirectUrl = '/auth') {
  const supabase = createServerClient(await cookies());
  await supabase.auth.signOut();
  return redirect(redirectUrl);
}
