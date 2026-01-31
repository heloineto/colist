import { Avatar, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { QueryBoundary } from '@/deprecated/packages/states';
import { AvatarError, AvatarLoading } from '@/deprecated/packages/uploader';
import { UserCard } from './components/user-card';
import { ColorThemeToggle } from './components/color-theme-toggle';
import { LanguageSelect } from './components/language-select';
import { SignOutButton } from './components/sign-out-button';
import { PrimaryColorSelect } from './components/primary-color-select';
import { useAuth } from '@/app/contexts/auth-context';
import { getProfilePicture } from '@/deprecated/utils/supabase/get-profile-picture';

export function UserMenu() {
  const [opened, { close, open }] = useDisclosure();
  const { profileQuery } = useAuth();

  return (
    <>
      <button
        className="mantine-focus-auto rounded-full border-none bg-transparent p-0"
        type="button"
        onClick={open}
      >
        <QueryBoundary
          query={profileQuery}
          loadingComponent={<AvatarLoading size={40} />}
          errorComponent={<AvatarError size={40} />}
        >
          {(query) => (
            <Avatar
              className="bg-body cursor-pointer rounded-xl border-none"
              name={query.data.name || undefined}
              color="initials"
              size={40}
              src={getProfilePicture(query.data)}
            />
          )}
        </QueryBoundary>
      </button>
      <Modal
        opened={opened}
        onClose={close}
        centered
        withCloseButton={false}
        classNames={{ header: '!p-0', body: '!p-0' }}
      >
        <UserCard />
        <div className="pb-md flex flex-col">
          <ColorThemeToggle />
          <LanguageSelect />
          <PrimaryColorSelect />
          <SignOutButton />
        </div>
      </Modal>
    </>
  );
}
