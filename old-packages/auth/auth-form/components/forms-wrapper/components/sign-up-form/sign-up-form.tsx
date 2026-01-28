import { Button, Popover, PopoverDropdown, PopoverTarget } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from '@information-systems/translations';
import { useMediaQuery } from '@mantine/hooks';
import { TextInput as OriginalTextInput } from 'mantine-hook-form';
import { EmailInput as OriginalEmailInput } from '../email-input';
import { useAuthFormContext } from '../../../../contexts/auth-form-context';
import { withAbsolute } from '../../../../hocs/with-absolute';
import classes from '../../forms-wrapper.module.css';
import { PasswordStrength } from '../password-strength';
import { PasswordInput as OriginalPasswordInput } from '../password-input';
import { useSignUpSchema } from './hooks/use-sign-up-schema';

const TextInput = withAbsolute(OriginalTextInput);
const EmailInput = withAbsolute(OriginalEmailInput);
const PasswordInput = withAbsolute(OriginalPasswordInput);

export function getSignUpSize(
  signUpFields:
    | {
        confirmPassword: boolean;
        name: boolean;
      }
    | undefined
) {
  let height = 196;
  const width = 320;

  if (signUpFields?.confirmPassword) {
    height += 80;
  }

  if (signUpFields?.name) {
    height += 80;
  }

  return {
    width,
    height,
  };
}

export function SignUpForm() {
  const { onSignUp, signUpFields } = useAuthFormContext();
  const { resolver } = useSignUpSchema();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      email: process.env.NEXT_PUBLIC_EMAIL ?? '',
      password: process.env.NEXT_PUBLIC_PASSWORD ?? '',
      confirm: process.env.NEXT_PUBLIC_PASSWORD ?? '',
      name: '',
    },
    resolver,
  });

  const signUpSize = getSignUpSize(signUpFields);

  const [opened, setOpened] = useState(false);

  const isMd = useMediaQuery('(min-width: 62em)');

  return (
    <FormProvider {...form}>
      <form
        className={classes.form}
        onSubmit={form.handleSubmit(
          async (values) => {
            await onSignUp(values);
          },
          (errors) => console.error(errors)
        )}
        style={{
          width: signUpSize.width,
          minWidth: signUpSize.width,
          height: signUpSize.height,
          minHeight: signUpSize.height,
        }}
        data-testid="sign-up-form"
      >
        {signUpFields?.name ? (
          <TextInput
            label={t({ pt: 'Nome', en: 'Name', es: 'Nombre' })}
            placeholder={t({
              pt: 'Seu nome ou apelido',
              en: 'Your name or nickname',
              es: 'Tu nombre o apodo',
            })}
            name="name"
          />
        ) : null}
        <EmailInput height="5rem" name="email" />
        <Popover
          position={isMd ? 'right' : 'bottom'}
          withArrow
          opened={opened}
          onChange={setOpened}
          offset={isMd ? 8 : -10}
        >
          <PopoverTarget>
            <div>
              <PasswordInput
                height="5rem"
                name="password"
                onFocus={() => setOpened(true)}
              />
            </div>
          </PopoverTarget>
          <PopoverDropdown>
            <PasswordStrength name="password" />
          </PopoverDropdown>
        </Popover>
        {signUpFields?.confirmPassword ? (
          <PasswordInput
            height="5rem"
            name="confirm"
            label={t({
              pt: 'Confirmar senha',
              en: 'Confirm password',
              es: 'Confirmar contraseña',
            })}
          />
        ) : (
          false
        )}
        <Button
          mt="0.5rem"
          fullWidth
          type="submit"
          loading={form.formState.isSubmitting}
        >
          {t({ pt: 'Criar conta', en: 'Create account', es: 'Crear cuenta' })}
        </Button>
      </form>
    </FormProvider>
  );
}
