import { useTranslation } from '@/deprecated/packages/translations';
import {
  PasswordInput as OriginalPasswordInput,
  type PasswordInputProps,
} from '@mantine/core';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { type ForwardedRef, forwardRef } from 'react';

export const PasswordInput = withController(
  forwardRef(function PasswordInput(
    props: PasswordInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) {
    const { t } = useTranslation();

    return (
      <OriginalPasswordInput
        label={t({ pt: 'Senha', en: 'Password', es: 'Contraseña' })}
        placeholder={t({
          pt: 'Sua senha',
          en: 'Your password',
          es: 'Tu contraseña',
        })}
        ref={ref}
        {...props}
      />
    );
  })
);
