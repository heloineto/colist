import { NoName, QueryBoundary } from '@information-systems/states';
import { ModalCloseButton, Skeleton, Button, Modal } from '@mantine/core';
import { useTranslation } from '@information-systems/translations';
import { useDisclosure } from '@information-systems/mantine';
import {
  type AvatarInput as AvatarInputType,
  AvatarLoading,
} from '@information-systems/uploader';
import dynamic from 'next/dynamic';
import { NotePencil } from '@phosphor-icons/react/dist/ssr';
import { useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { ProfileForm } from './profile-form';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/utils/supabase/create-browser-client';
import { PROFILES_COLUMNS, PROFILES_TABLE } from '@/utils/queries/profiles';
import { MEMBERS_TABLE } from '@/utils/queries/members';

const AvatarInput = dynamic(
  // @ts-expect-error --- TypeScript does not like that AvatarInput is a polymorphic component
  () => import('@information-systems/uploader').then((mod) => mod.AvatarInput),
  { loading: () => <AvatarLoading size="xl" /> }
) as typeof AvatarInputType;

export function UserCard() {
  const { profileQuery } = useAuth();
  const { t } = useTranslation();
  const editDisclosure = useDisclosure();
  const updateMutation = useUpdateMutation(
    supabase.from(PROFILES_TABLE),
    ['id'],
    PROFILES_COLUMNS,
    { revalidateTables: [{ table: MEMBERS_TABLE }] }
  );

  return (
    <div className="flex grow justify-between p-md">
      <div className="mr-xs flex grow items-center gap-xs text-black dark:text-dark-0">
        <QueryBoundary
          query={profileQuery}
          errorProps={{
            title: t({
              pt: 'Erro ao carregar usuário',
              en: 'Error loading user',
              es: 'Error al cargar usuario',
            }),
            classNames: { root: 'grow mr-xs', body: '!flex-row' },
          }}
          loadingComponent={
            <>
              <AvatarLoading size="lg" />
              <div className="grow">
                <Skeleton className="my-2 !h-4 !w-32" />
                <Skeleton className="my-2 !h-3 !w-40" />
              </div>
            </>
          }
        >
          {({ data: profile }) => {
            const editProfile = t({
              pt: 'Editar perfil',
              en: 'Edit profile',
              es: 'Editar perfil',
            });

            return (
              <>
                <AvatarInput
                  name={profile.name || undefined}
                  color="initials"
                  bucket="profiles"
                  client={supabase}
                  path={profile.id}
                  size="xl"
                  value={profile.picture}
                  uploaderProps={{
                    title: t({
                      pt: 'Foto de perfil',
                      en: 'Profile picture',
                      es: 'Foto de perfil',
                    }),
                  }}
                  onChange={(file) => {
                    updateMutation.mutate({
                      id: profile.id,
                      picture: file,
                    });
                  }}
                />

                <div className="mt-1 grow">
                  <div className="relative text-lg font-medium leading-6">
                    {profile.name || <NoName />}
                  </div>
                  <div className="text-md font-normal leading-6 text-dimmed">
                    {profile.email}
                  </div>
                  <Button
                    classNames={{
                      root: '-ml-[0.375rem] mt-0.5',
                      label: 'uppercase',
                    }}
                    leftSection={<NotePencil size="1rem" weight="bold" />}
                    size="compact-xs"
                    variant="subtle"
                    radius="xl"
                    px="0.375rem"
                    onClick={editDisclosure.open}
                  >
                    {editProfile}
                  </Button>
                </div>
                <Modal
                  opened={editDisclosure.opened}
                  onClose={editDisclosure.close}
                  title={editProfile}
                >
                  <ProfileForm
                    profile={profile}
                    onClose={editDisclosure.close}
                  />
                </Modal>
              </>
            );
          }}
        </QueryBoundary>
      </div>
      <ModalCloseButton />
    </div>
  );
}
