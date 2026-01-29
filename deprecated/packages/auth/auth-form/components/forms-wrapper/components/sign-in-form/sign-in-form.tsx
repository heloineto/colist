import { Anchor, Button } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from '@/deprecated/packages/translations';
import { Checkbox } from '@/deprecated/packages/mantine-hook-form';
import { PasswordInput as OriginalPasswordInput } from '../password-input';
import { useAuthFormContext } from '../../../../contexts/auth-form-context';
import classes from '../../forms-wrapper.module.css';
import { withAbsolute } from '../../../../hocs/with-absolute';
import { EmailInput as OriginalEmailInput } from '../email-input';
import { useSignInSchema } from './hooks/use-sign-in-schema';

const EmailInput = withAbsolute(OriginalEmailInput);
const PasswordInput = withAbsolute(OriginalPasswordInput);

export const SIGN_IN_HEIGHT = 254;
export const SIGN_IN_WIDTH = 320;

export interface SignInFormProps {
  onClickResetPassword: () => void;
}

export function SignInForm({ onClickResetPassword }: SignInFormProps) {
  const { onSignIn, resetPassword = true } = useAuthFormContext();
  const { resolver } = useSignInSchema();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      email: process.env.NEXT_PUBLIC_EMAIL ?? '',
      password: process.env.NEXT_PUBLIC_PASSWORD ?? '',
      remember: true,
    },
    resolver,
  });

  return (
    <FormProvider {...form}>
      <form
        className={classes.form}
        onSubmit={form.handleSubmit(
          async (values) => {
            await onSignIn(values);
          },
          (errors) => console.error(errors)
        )}
        style={{
          width: SIGN_IN_WIDTH,
          minWidth: SIGN_IN_WIDTH,
          height: SIGN_IN_HEIGHT,
          minHeight: SIGN_IN_HEIGHT,
        }}
        data-testid="sign-in-form"
      >
        <EmailInput height="5rem" name="email" />
        <PasswordInput height="5rem" name="password" />
        <div className={classes.rememberWrapper}>
          <Checkbox
            // FUTURE: Implementar funcionalidade de lembrar/esquecer usuário
            name="remember"
            label={t({
              pt: 'Lembrar de mim',
              en: 'Remember me',
              es: 'Recordarme',
            })}
          />
          {resetPassword ? (
            <Anchor
              component="button"
              size="sm"
              type="button"
              onClick={onClickResetPassword}
              ta="right"
            >
              {t({
                pt: 'Esqueceu a senha?',
                en: 'Forgot password?',
                es: '¿Olvidó la contraseña?',
              })}
            </Anchor>
          ) : null}
        </div>
        <Button
          fullWidth
          mt="xl"
          type="submit"
          loading={form.formState.isSubmitting}
        >
          {t({
            pt: 'Entrar',
            en: 'Sign in',
            es: 'Ingresar',
          })}
        </Button>
      </form>
    </FormProvider>
  );
}
