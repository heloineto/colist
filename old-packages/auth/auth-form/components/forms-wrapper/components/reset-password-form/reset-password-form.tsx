import { Anchor, Button } from '@mantine/core';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from '@information-systems/translations';
import { EmailInput as OriginalEmailInput } from '../email-input';
import classes from '../../forms-wrapper.module.css';
import { withAbsolute } from '../../../../hocs/with-absolute';
import { useAuthFormContext } from '../../../../contexts/auth-form-context';
import { useResetPasswordSchema } from './hooks/use-reset-password-schema';

const EmailInput = withAbsolute(OriginalEmailInput);

export const RESET_PASSWORD_HEIGHT = 152;
export const RESET_PASSWORD_WIDTH = 320;

export interface ResetPasswordFormProps {
  onClickSignUp: () => void;
}

export function ResetPasswordForm({ onClickSignUp }: ResetPasswordFormProps) {
  const { onResetPassword } = useAuthFormContext();
  const { resolver } = useResetPasswordSchema();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      email: process.env.NEXT_PUBLIC_EMAIL ?? '',
    },
    resolver,
  });

  return (
    <FormProvider {...form}>
      <form
        className={classes.form}
        onSubmit={form.handleSubmit(
          async (values) => {
            await onResetPassword?.(values);
          },
          (errors) => console.error(errors)
        )}
        style={{
          width: RESET_PASSWORD_WIDTH,
          minWidth: RESET_PASSWORD_WIDTH,
          height: RESET_PASSWORD_HEIGHT,
          minHeight: RESET_PASSWORD_HEIGHT,
        }}
      >
        <EmailInput height="5rem" name="email" />
        <div className={classes.resetPasswordWrapper}>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t({
              pt: 'Redefinir senha',
              en: 'Reset password',
              es: 'Restablecer contraseña',
            })}
          </Button>
          <Anchor
            className={classes.resetPasswordAnchor}
            c="dimmed"
            size="sm"
            onClick={onClickSignUp}
            component="button"
            type="button"
          >
            <span>
              {t({
                pt: 'Voltar para a página de login',
                en: 'Back to login page',
                es: 'Volver a la página de login',
              })}
            </span>
            <ArrowRight size="0.875rem" weight="bold" />
          </Anchor>
        </div>
      </form>
    </FormProvider>
  );
}
