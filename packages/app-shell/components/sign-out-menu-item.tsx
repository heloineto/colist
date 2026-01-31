'use client';

import { SignOutIcon } from '@phosphor-icons/react/dist/ssr';
import { forwardRef, useState } from 'react';
import type { ButtonProps } from '@mantine/core';
import { createPolymorphicComponent, Button, Loader } from '@mantine/core';

interface Props extends ButtonProps {
  onSignOut: () => Promise<void>;
}

export const SignOutMenuItem = createPolymorphicComponent<'button', Props>(
  forwardRef<HTMLButtonElement, Props>(function SignOutButton(
    { onSignOut, ...rest },
    ref
  ) {
    const [loading, setLoading] = useState(false);

    return (
      <Button
        className="px-sm"
        justify="start"
        leftSection={
          loading ? (
            <Loader size="xs" color="var(--mantine-color-red-light-color)" />
          ) : (
            <SignOutIcon size={18} weight="bold" />
          )
        }
        type="button"
        variant="light"
        onClick={async () => {
          setLoading(true);
          await onSignOut();
          // NOTE: Wait for navigation to complete
          setTimeout(() => setLoading(false), 3000);
        }}
        ref={ref}
        {...rest}
      >
        Sair da conta
      </Button>
    );
  })
);
