import { Anchor, Avatar, Paper } from '@mantine/core';
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
  const signingIn = panel === 'sign-in';

  return (
    <main className="dark:bg-dark-900 flex min-h-dvh flex-col bg-gray-50">
      <div className="flex grow flex-col items-center justify-center p-4">
        <header className="dark:border-dark-400 mb-4 flex w-full max-w-[370px] flex-col items-center gap-2 border-b border-gray-300 pb-4">
          <Avatar size="lg" radius="xs" src="/logo.svg" />
          <h1 className="w-full truncate text-center text-2xl font-semibold">
            {t('auth.appTitle')}
          </h1>
        </header>
        <div className="text-center">
          <h2 className="text-[1.625rem] font-bold">
            {signingIn ? t('auth.signIn.title') : t('auth.signUp.title')}
          </h2>
          <p className="text-dimmed mt-1 text-sm">
            {signingIn
              ? t('auth.signIn.noAccount')
              : t('auth.signUp.hasAccount')}{' '}
            <Anchor
              size="sm"
              component="button"
              type="button"
              onClick={() => setPanel(signingIn ? 'sign-up' : 'sign-in')}
            >
              {signingIn ? t('auth.signIn.switch') : t('auth.signUp.switch')}
            </Anchor>
          </p>
        </div>
        <Paper
          withBorder
          shadow="md"
          radius="md"
          className="mt-5 w-full max-w-[370px] overflow-hidden transition-[height] duration-500"
          style={{ height: height || undefined }}
        >
          <div
            className="flex items-start transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(${signingIn ? 0 : -100}%)`,
            }}
          >
            <div className="w-full shrink-0 p-[25px]" ref={signIn.ref}>
              <SignInForm />
            </div>
            <div className="w-full shrink-0 p-[25px]" ref={signUp.ref}>
              <SignUpForm />
            </div>
          </div>
        </Paper>
      </div>
      <AuthFooter />
    </main>
  );
}
