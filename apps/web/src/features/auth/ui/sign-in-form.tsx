import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuthSubmit } from '@/features/auth/lib/use-auth-submit';
import { GoogleButton } from '@/features/auth/ui/google-button';
import { authClient } from '@/shared/api/auth-client';

export function SignInForm() {
  const { t } = useTranslation();
  const { submit, loading } = useAuthSubmit();
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: { email: isEmail(t('auth.validation.email')) },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.onSubmit(
        (values) => void submit(() => authClient.signIn.email(values))
      )}
    >
      <TextInput
        label={t('auth.fields.email')}
        placeholder={t('auth.fields.emailPlaceholder')}
        type="email"
        autoComplete="email"
        {...form.getInputProps('email')}
      />
      <PasswordInput
        label={t('auth.fields.password')}
        placeholder={t('auth.fields.passwordPlaceholder')}
        autoComplete="current-password"
        {...form.getInputProps('password')}
      />
      {/* FUTURE: wire "remember me" (visual parity with v1 for now) */}
      <Checkbox defaultChecked label={t('auth.rememberMe')} className="mt-1" />
      <Button type="submit" fullWidth mt="md" loading={loading}>
        {t('auth.signIn.submit')}
      </Button>
      <GoogleButton />
    </form>
  );
}
