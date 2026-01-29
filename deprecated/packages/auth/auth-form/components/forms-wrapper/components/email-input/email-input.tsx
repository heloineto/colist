import { useTranslation } from '@/deprecated/packages/translations';
import { TextInput, type TextInputProps } from '@mantine/core';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { type ForwardedRef, forwardRef } from 'react';

export const EmailInput = withController(
  forwardRef(function EmailInput(
    props: TextInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) {
    const { t } = useTranslation();

    return (
      <TextInput
        label={t({ pt: 'E-mail', en: 'E-mail', es: 'E-mail' })}
        placeholder={t({
          pt: 'voce@exemplo.com',
          en: 'you@example.com',
          es: 'tu@ejemplo.com',
        })}
        ref={ref}
        {...props}
      />
    );
  })
);
