'use client';

import { use } from 'react';
import { AuthForm } from '@/deprecated/packages/auth';
import { useTranslation } from '@/deprecated/packages/translations';
import { signIn } from '@/deprecated/packages/supabase/sign-in';
import { signUp } from '@/deprecated/packages/supabase/sign-up';

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default function Page(props: Props) {
  const searchParams = use(props.searchParams);

  const { error, success } = searchParams;

  const { t } = useTranslation();

  return (
    <AuthForm
      onSignIn={signIn}
      onSignUp={signUp}
      resetPassword={false}
      title={t({
        pt: 'Lista de Compras',
        en: 'Shopping List',
        es: 'Lista de Compras',
      })}
      signUpFields={{
        confirmPassword: false,
        name: true,
      }}
      logo="/logo.svg"
      error={error}
      success={success}
    />
  );
}
