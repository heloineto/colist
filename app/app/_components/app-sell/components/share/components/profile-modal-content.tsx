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
    <div className="gap-xs flex flex-col">
      <div className="px-md pt-md relative flex justify-center">
        <Avatar
          className="border-body bg-body relative z-10 border-[5px] border-solid"
          name={profile.name || undefined}
          color="initials"
          size={100}
          src={getProfilePicture(profile)}
        />
        <div
          className="bg-blue-light-hover absolute top-0 left-0 h-4/5 w-full"
          style={{
            backgroundColor: `var(--mantine-color-${getColor(getInitials(profile.name ?? ''))}-light-hover,#228be61f)`,
          }}
        />
      </div>
      <div className="px-md text-center">
        <div className="text-xl leading-5 font-bold">{profile.name}</div>
        <div className="text-md text-dimmed">{profile.email}</div>
      </div>
      <div className="mt-lg gap-xs px-md pb-md xs:flex-row flex flex-col">
        <Button
          className="xs:basis-0 grow"
          variant="default"
          onClick={() => modals.closeAll()}
        >
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button
          className="xs:basis-0 grow"
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
