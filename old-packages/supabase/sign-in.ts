import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from './create-server-client';
import { translate } from './translate';

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const language = 'pt';

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);

    let message;

    if (error.status === 400) {
      message = translate(
        {
          pt: 'E-mail ou senha inválidos',
          en: 'Invalid e-mail or password',
          es: 'Correo electrónico o contraseña inválidos',
        },
        language
      );
    }

    return redirect(
      `/auth?error=${encodeURIComponent(
        message ??
          translate(
            {
              pt: 'Erro ao fazer login',
              en: 'Error signing in',
              es: 'Error al iniciar sesión',
            },
            language
          )
      )}`
    );
  }

  return redirect('/app');
}
