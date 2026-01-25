import { useTranslation } from '@information-systems/translations';
import { Avatar, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { showNotification } from '@mantine/notifications';
import { getColor } from '../utils/get-color';
import { getInitials } from '../utils/get-initials';
import { MEMBERS_COLUMNS, MEMBERS_TABLE } from '@/utils/queries/members';
import { getProfilePicture } from '@/utils/supabase/get-profile-picture';
import type { Profile } from '@/utils/queries/profiles';
import { supabase } from '@/utils/supabase/create-browser-client';

export interface Props {
  listId: number;
  profile: Profile;
}

export function ProfileModalContent({ profile, listId }: Props) {
  const { t } = useTranslation();

  const insertMutation = useInsertMutation(
    supabase.from(MEMBERS_TABLE),
    ['profileId', 'listId'],
    MEMBERS_COLUMNS,
    {
      onSuccess: () => modals.closeAll(),
      revalidateTables: [
        {
          table: MEMBERS_TABLE,
          schema: 'public',
        },
      ],
    }
  );

  return (
    <div className="flex flex-col gap-xs">
      <div className="relative flex justify-center px-md pt-md">
        <Avatar
          className="relative z-10 border-[5px] border-solid border-body bg-body"
          name={profile.name || undefined}
          color="initials"
          size={100}
          src={getProfilePicture(profile)}
        />
        <div
          className="absolute left-0 top-0 h-4/5 w-full bg-blue-light-hover"
          style={{
            backgroundColor: `var(--mantine-color-${getColor(getInitials(profile.name ?? ''))}-light-hover,#228be61f)`,
          }}
        />
      </div>
      <div className="px-md text-center">
        <div className="text-xl font-bold leading-5">{profile.name}</div>
        <div className="text-md text-dimmed">{profile.email}</div>
      </div>
      <div className="mt-lg flex flex-col gap-xs px-md pb-md xs:flex-row">
        <Button
          className="grow xs:basis-0"
          variant="default"
          onClick={() => modals.closeAll()}
        >
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button
          className="grow xs:basis-0"
          onClick={async () => {
            if (!listId) {
              showNotification({
                message: t({
                  pt: 'Nenhuma lista selecionada',
                  en: 'No list selected',
                  es: 'No se ha seleccionado ninguna lista',
                }),
                color: 'red',
              });
              return;
            }

            await insertMutation.mutateAsync([
              { listId, profileId: profile.id, role: 'member' },
            ]);
          }}
        >
          {t({
            pt: 'Adicionar membro',
            en: 'Add member',
            es: 'Agregar miembro',
          })}
        </Button>
      </div>
    </div>
  );
}
