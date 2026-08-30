import { Avatar, Paper } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignInForm } from '@/features/auth/ui/sign-in-form';
import { SignUpForm } from '@/features/auth/ui/sign-up-form';
import { AuthFooter } from '@/pages/auth/ui/auth-footer';

type Panel = 'sign-in' | 'sign-up';

export function AuthPage() {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<Panel>('sign-in');
  const signIn = useElementSize();
  const signUp = useElementSize();
  const height = panel === 'sign-in' ? signIn.height : signUp.height;

  return (
    <main className="flex min-h-dvh flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-center gap-4 p-4">
        <header className="flex w-full max-w-80 items-center gap-3">
          <Avatar size="lg" radius="xs" src="/logo.svg" />
          <h1 className="truncate text-xl font-semibold">{t('auth.appTitle')}</h1>
        </header>
        <Paper
          withBorder
          shadow="md"
          radius="md"
          className="w-full max-w-80 overflow-hidden transition-[height] duration-500"
          style={{ height: height ? height + 50 : undefined }}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${panel === 'sign-in' ? 0 : -100}%)` }}
          >
            <div className="w-full shrink-0 p-[25px]" ref={signIn.ref}>
              <SignInForm onSwitch={() => setPanel('sign-up')} />
            </div>
            <div className="w-full shrink-0 p-[25px]" ref={signUp.ref}>
              <SignUpForm onSwitch={() => setPanel('sign-in')} />
            </div>
          </div>
        </Paper>
      </div>
      <AuthFooter />
    </main>
  );
}

