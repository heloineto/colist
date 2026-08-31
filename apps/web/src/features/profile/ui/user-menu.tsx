import {
  Loader,
  Modal,
  ModalCloseButton,
  NavLink,
  Select,
  Skeleton,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CheckIcon, SignOutIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/entities/user';
import { UserCard } from '@/features/profile/ui/user-card';
import { useMe } from '@/shared/api/generated/me/me';
import { authClient } from '@/shared/api/auth-client';
import { PRIMARY_COLORS, usePrimaryColor } from '@/shared/lib/preferences';
import { ColorSchemeToggle } from '@/shared/ui/color-scheme-toggle';
import { LanguageSelect } from '@/shared/ui/language-select';

function PrimaryColorSelect() {
  const { t } = useTranslation();
  const [color, setColor] = usePrimaryColor();
  return (
    <Select
      variant="unstyled"
      size="md"
      allowDeselect={false}
      className="dark:hover:bg-dark-800 px-4 pt-0.5 hover:bg-gray-100"
      leftSectionWidth={29}
      leftSectionProps={{ className: 'justify-start!' }}
      leftSection={
        <span
          className="size-4.5 rounded-full"
          style={{ background: `var(--mantine-color-${color}-filled)` }}
        />
      }
      value={color}
      onChange={(value) => value && setColor(value)}
      data={PRIMARY_COLORS.map((value) => ({
        value,
        label: t(`profile.colors.${value}`),
      }))}
      renderOption={({ option, checked }) => (
        <span className="flex items-center gap-2">
          <span
            className="size-4.5 rounded-full"
            style={{
              background: `var(--mantine-color-${option.value}-filled)`,
            }}
          />
          {option.label}
          {checked && <CheckIcon size="0.8em" className="opacity-40" />}
        </span>
      )}
    />
  );
}

function SignOutButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const signOut = async () => {
    setLoading(true);
    await authClient.signOut();
    queryClient.clear();
    await navigate({ to: '/auth' });
  };
  return (
    <NavLink
      component="button"
      active
      variant="subtle"
      label={t('profile.signOut')}
      classNames={{
        root: 'bg-gray-50 dark:bg-dark-700 data-[active]:hover:bg-gray-100 dark:data-[active]:hover:bg-dark-800 px-4!',
        label: 'text-gray-900 dark:text-dark-50 text-md!',
      }}
      leftSection={
        loading ? (
          <Loader size="1.125rem" />
        ) : (
          <SignOutIcon
            size="1.125rem"
            weight="bold"
            className="dark:text-dark-50 text-gray-600"
          />
        )
      }
      onClick={() => void signOut()}
    />
  );
}

export function UserMenu() {
  const [opened, { open, close }] = useDisclosure(false);
  const meQuery = useMe();
  const me = meQuery.data;

  return (
    <>
      <UnstyledButton
        onClick={open}
        className="rounded-xl"
        aria-label="profile"
      >
        {me ? (
          <UserAvatar name={me.name} image={me.image} size={40} />
        ) : (
          <Skeleton circle h={40} w={40} />
        )}
      </UnstyledButton>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        classNames={{ header: 'p-0!', body: 'p-0!' }}
      >
        <div className="flex items-start justify-between p-4">
          <UserCard me={me} />
          <ModalCloseButton />
        </div>
        <div className="flex flex-col pb-4">
          <ColorSchemeToggle className="rounded-none!" />
          <LanguageSelect className="dark:hover:bg-dark-800 px-4 pt-0.5 hover:bg-gray-100" />
          <PrimaryColorSelect />
          <SignOutButton />
        </div>
      </Modal>
    </>
  );
}
