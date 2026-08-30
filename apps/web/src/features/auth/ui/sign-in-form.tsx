import { Anchor, Button, PasswordInput, TextInput } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuthSubmit } from '@/features/auth/lib/use-auth-submit';
import { GoogleButton } from '@/features/auth/ui/google-button';
import { authClient } from '@/shared/api/auth-client';

export function SignInForm({ onSwitch }: { onSwitch: () => void }) {
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
      <h2 className="text-lg font-semibold">{t('auth.signIn.title')}</h2>
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
      <Button type="submit" fullWidth mt="md" loading={loading}>
        {t('auth.signIn.submit')}
      </Button>
      <GoogleButton />
      <p className="mt-2 text-center text-sm">
        {t('auth.signIn.noAccount')}{' '}
        <Anchor component="button" type="button" size="sm" onClick={onSwitch}>
          {t('auth.signIn.switch')}
        </Anchor>
      </p>
    </form>
  );
}
