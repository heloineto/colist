'use client';

import { use } from 'react';
import { AuthForm } from '@information-systems/auth';
import { useTranslation } from '@information-systems/translations';
import { signIn } from '@/old-packages/supabase/sign-in';
import { signUp } from '@/old-packages/supabase/sign-up';

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
        pt: 'Colist - Lista de Compras',
        en: 'Colist - Shopping List',
        es: 'Colist - Lista de Compras',
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
