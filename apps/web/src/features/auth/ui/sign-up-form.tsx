import {
  Button,
  Collapse,
  PasswordInput,
  Popover,
  TextInput,
} from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isStrongPassword } from '@/features/auth/lib/password';
import { useAuthSubmit } from '@/features/auth/lib/use-auth-submit';
import { GoogleButton } from '@/features/auth/ui/google-button';
import { PasswordStrength } from '@/features/auth/ui/password-strength';
import { authClient } from '@/shared/api/auth-client';

export function SignUpForm() {
  const { t } = useTranslation();
  const { submit, loading } = useAuthSubmit();
  const isWide = useMediaQuery('(min-width: 62em)');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: isNotEmpty(t('auth.validation.name')),
      email: isEmail(t('auth.validation.email')),
      password: (value) =>
        isStrongPassword(value) ? null : t('auth.validation.password'),
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.onSubmit(
        (values) => void submit(() => authClient.signUp.email(values))
      )}
    >
      <TextInput
        label={t('auth.fields.name')}
        placeholder={t('auth.fields.namePlaceholder')}
        autoComplete="name"
        {...form.getInputProps('name')}
      />
      <TextInput
        label={t('auth.fields.email')}
        placeholder={t('auth.fields.emailPlaceholder')}
        type="email"
        autoComplete="email"
        {...form.getInputProps('email')}
      />
      <Popover
        opened={isWide && popoverOpened}
        position="right"
        width="target"
        offset={8}
        transitionProps={{ transition: 'pop' }}
      >
        <Popover.Target>
          <div
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
          >
            <PasswordInput
              label={t('auth.fields.password')}
              placeholder={t('auth.fields.passwordPlaceholder')}
              autoComplete="new-password"
              {...form.getInputProps('password')}
            />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <PasswordStrength value={form.values.password} />
        </Popover.Dropdown>
      </Popover>
      <Collapse expanded={!isWide && popoverOpened}>
        <PasswordStrength value={form.values.password} />
      </Collapse>
      <Button type="submit" fullWidth mt="md" loading={loading}>
        {t('auth.signUp.submit')}
      </Button>
      <GoogleButton />
    </form>
  );
}
