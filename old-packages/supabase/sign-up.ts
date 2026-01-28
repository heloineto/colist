'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from './create-server-client';
import { translate } from './translate';

const DEFAULT_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export async function signUp({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const language = 'pt';

  const data: Record<string, unknown> = {};
  if (name) data.name = name;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${DEFAULT_URL}/auth/callback`,
      data,
    },
  });

  if (error) {
    console.error(error);

    let message;

    if (error.status === 422) {
      message = translate(
        {
          pt: 'E-mail já está em uso',
          en: 'E-mail already in use',
          es: 'Correo electrónico ya está en uso',
        },
        language
      );
    }

    return redirect(
      `/auth?error=${encodeURIComponent(
        message ??
          translate(
            {
              pt: 'Não foi possível criar conta',
              en: 'Could not create account',
              es: 'No se pudo crear la cuenta',
            },
            language
          )
      )}`
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    return redirect('/app');
  }

  return redirect(
    `/auth?success=${translate(
      {
        en: 'Check e-mail to continue sign in process',
        pt: 'Verifique o e-mail para continuar o processo de login',
        es: 'Verifique el e-mail para continuar con el proceso de inicio de sesión',
      },
      language
    )}`
  );
}
