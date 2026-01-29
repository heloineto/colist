import { Avatar, AvatarGroup, Tooltip, TooltipGroup } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { useDisclosure } from '@/deprecated/packages/mantine';
import {
  useQuery,
  useSubscription,
} from '@supabase-cache-helpers/postgrest-react-query';
import { QueryBoundary } from '@/deprecated/packages/states';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@/deprecated/packages/supabase/get-query-key';
import { ShareButton } from './components/share-button';
import { ShareModal } from './components/share-modal';
import {
  MemberFormProvider,
  useMemberFormProvider,
} from './contexts/member-form-context';
import { useListContext } from '@/app/app/_utils/list-context';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import type { Member } from '@/deprecated/utils/queries/members';
import {
  MEMBERS_COLUMNS,
  MEMBERS_TABLE,
} from '@/deprecated/utils/queries/members';
import { useAuth } from '@/contexts/auth-context';
import { getProfilePicture } from '@/deprecated/utils/supabase/get-profile-picture';
import { LISTS_TABLE } from '@/deprecated/utils/queries/lists';

const MAX_AVATARS = 4;

export function Share() {
  const { t } = useTranslation();
  const { profileQuery } = useAuth();
  const { listId, listsQuery } = useListContext();
  const list = listsQuery.data?.find((l) => l.id === listId);
  const membersQuery = useQuery(
    supabase
      .from(MEMBERS_TABLE)
      .select(MEMBERS_COLUMNS)
      .eq('listId', listId as number)
      .order('role', { ascending: true }),
    { enabled: listId !== null }
  );
  const memberForm = useMemberFormProvider();

  const queryClient = useQueryClient();
  useSubscription(
    supabase,
    MEMBERS_TABLE,
    { event: '*', table: MEMBERS_TABLE, schema: 'public' },
    ['id'],
    {
      callback: () => {
        queryClient.invalidateQueries({
          queryKey: getQueryKey({ table: LISTS_TABLE }),
        });
        membersQuery.refetch();
      },
    }
  );

  const disclosure = useDisclosure();

  if (!list || membersQuery.isPending) {
    return (
      <Tooltip
        label={t({
          pt: 'Selecione uma lista para compartilhar',
          en: 'Select a list to share',
          es: 'Seleccione una lista para compartir',
        })}
      >
        <ShareButton disabled />
      </Tooltip>
    );
  }

  return (
    <QueryBoundary query={membersQuery}>
      {({ data: members }) => {
        const modal = (
          <MemberFormProvider form={memberForm}>
            <ShareModal
              members={members}
              opened={disclosure.opened}
              onClose={disclosure.close}
              list={list}
            />
          </MemberFormProvider>
        );

        const sortedMembers = [...members].sort((a, b) => {
          if (a.profileId === profileQuery.data?.id) return -1;
          if (b.profileId === profileQuery.data?.id) return 1;
          return 0;
        });

        if (sortedMembers.length <= 1) {
          return (
            <>
              <ShareButton onClick={disclosure.open} />
              {modal}
            </>
          );
        }

        let firstMembers: Member[];
        let otherMembers: Member[];

        if (sortedMembers.length <= MAX_AVATARS) {
          firstMembers = sortedMembers;
          otherMembers = [];
        } else {
          firstMembers = sortedMembers.slice(0, MAX_AVATARS - 1);
          otherMembers = sortedMembers.slice(MAX_AVATARS - 1);
        }

        return (
          <>
            <TooltipGroup openDelay={300} closeDelay={100}>
              <AvatarGroup
                className="mantine-focus-auto rounded-sm border-none bg-transparent"
                spacing="md"
                component="button"
                onClick={disclosure.open}
              >
                {firstMembers.map((member) => (
                  <Tooltip
                    withArrow
                    label={member.profile?.name}
                    key={`${member.profileId}${member.listId}`}
                  >
                    <Avatar
                      name={member.profile?.name || undefined}
                      color="initials"
                      radius="xl"
                      src={getProfilePicture(member.profile)}
                    />
                  </Tooltip>
                ))}
                {otherMembers.length > 0 ? (
                  <Tooltip
                    withArrow
                    label={
                      <>
                        {otherMembers.map((member) => (
                          <div key={`${member.profileId}${member.listId}`}>
                            {member.profile?.name}
                          </div>
                        ))}
                      </>
                    }
                  >
                    <Avatar radius="xl">{`+${otherMembers.length}`}</Avatar>
                  </Tooltip>
                ) : null}
              </AvatarGroup>
            </TooltipGroup>
            {modal}
          </>
        );
      }}
    </QueryBoundary>
  );
}
