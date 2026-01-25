import { useTranslation } from '@information-systems/translations';
import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { ShareNetwork } from '@phosphor-icons/react/dist/ssr';
import {
  type ForwardedRef,
  type ComponentPropsWithoutRef,
  forwardRef,
} from 'react';

interface Props
  extends
    ButtonProps,
    Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps> {}

export const ShareButton = forwardRef(function ShareButton(
  { ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const { t } = useTranslation();

  return (
    <Button
      size="xs"
      variant="light"
      leftSection={<ShareNetwork size="1rem" />}
      ref={ref}
      {...rest}
    >
      {t({ pt: 'Convidar', es: 'Invitar', en: 'Invite' })}
    </Button>
  );
});
