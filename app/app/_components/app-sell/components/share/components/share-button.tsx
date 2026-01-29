import { useTranslation } from '@/deprecated/packages/translations';
import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { ShareNetworkIcon } from '@phosphor-icons/react/dist/ssr';
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
      leftSection={<ShareNetworkIcon size="1rem" />}
      ref={ref}
      {...rest}
    >
      {t({ pt: 'Convidar', es: 'Invitar', en: 'Invite' })}
    </Button>
  );
});
