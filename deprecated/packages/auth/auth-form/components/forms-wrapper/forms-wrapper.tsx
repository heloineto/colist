import { Anchor, Paper } from '@mantine/core';
import { type CSSProperties, useState } from 'react';
import { useTranslation } from '@/deprecated/packages/translations';
import { useAuthFormContext } from '../../contexts';
import {
  SIGN_IN_HEIGHT,
  SIGN_IN_WIDTH,
  SignInForm,
} from './components/sign-in-form';
import { getSignUpSize, SignUpForm } from './components/sign-up-form';
import {
  RESET_PASSWORD_HEIGHT,
  RESET_PASSWORD_WIDTH,
  ResetPasswordForm,
} from './components/reset-password-form';
import classes from './forms-wrapper.module.css';
import { FormHeader } from './components/form-header';

export function FormsWrapper() {
  const { t } = useTranslation();
  const [currentForm, setCurrentForm] = useState<
    'sign-in' | 'sign-up' | 'reset-password'
  >('sign-in');
  const { signUpFields } = useAuthFormContext();
  const signUpSize = getSignUpSize(signUpFields);

  let header;
  let index;
  let width;
  let height;

  switch (currentForm) {
    case 'reset-password':
      header = (
        <FormHeader
          title={t({
            pt: 'Esqueceu sua senha?',
            en: 'Forgot your password?',
            es: '¿Olvidaste tu contraseña?',
          })}
          subtitle={t({
            pt: 'Digite seu e-mail para redefinir.',
            en: 'Enter your email to reset.',
            es: 'Ingrese su correo electrónico para restablecer.',
          })}
        />
      );
      width = RESET_PASSWORD_WIDTH;
      height = RESET_PASSWORD_HEIGHT;
      index = 0;
      break;
    case 'sign-in':
      header = (
        <FormHeader
          title={t({
            pt: 'Entrar na sua conta',
            en: 'Sign in to your account',
            es: 'Ingrese a su cuenta',
          })}
          subtitle={
            <>
              {t({
                pt: 'Ainda não tem uma conta? ',
                en: "Don't have an account yet? ",
                es: '¿No tienes una cuenta todavía? ',
              })}
              <Anchor
                size="sm"
                component="button"
                onClick={() => setCurrentForm('sign-up')}
              >
                {t({
                  pt: 'Criar uma conta',
                  en: 'Create an account',
                  es: 'Crear una cuenta',
                })}
              </Anchor>
            </>
          }
        />
      );
      width = SIGN_IN_WIDTH;
      height = SIGN_IN_HEIGHT;
      index = 1;
      break;
    case 'sign-up':
      header = (
        <FormHeader
          title={t({
            pt: 'Criar uma conta',
            en: 'Create an account',
            es: 'Crear una cuenta',
          })}
          subtitle={
            <>
              {t({
                pt: 'Já tem uma conta? ',
                en: 'Already have an account? ',
                es: '¿Ya tienes una cuenta? ',
              })}
              <Anchor
                size="sm"
                component="button"
                onClick={() => setCurrentForm('sign-in')}
              >
                {t({ pt: 'Entrar', en: 'Sign in', es: 'Ingresar' })}
              </Anchor>
            </>
          }
        />
      );
      width = signUpSize.width;
      height = signUpSize.height;
      index = 2;
      break;
  }

  return (
    <div className={classes.formWrapper}>
      {header}
      <Paper
        className={classes.paper}
        withBorder
        shadow="md"
        radius="md"
        style={{
          '--auth-form-width': `${width}px`,
          '--auth-form-height': `${height}px`,
        }}
      >
        <div
          className={classes.formSelector}
          style={{ '--auth-form-index': index } as CSSProperties}
        >
          <ResetPasswordForm onClickSignUp={() => setCurrentForm('sign-in')} />
          <SignInForm
            onClickResetPassword={() => setCurrentForm('reset-password')}
          />
          <SignUpForm />
        </div>
      </Paper>
    </div>
  );
}
