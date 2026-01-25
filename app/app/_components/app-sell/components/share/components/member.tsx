import {
  ActionIcon,
  Avatar,
  Button,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
} from '@mantine/core';
import { useTranslation } from '@information-systems/translations';
import { modals } from '@mantine/modals';
import { DotsThreeOutlineVertical, X } from '@phosphor-icons/react/dist/ssr';
import { BaseModalContent } from '@information-systems/mantine';
import { useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { NoName } from '@information-systems/states';
import { RoleBadge } from './role-badge';
import {
  MEMBERS_COLUMNS_BASE,
  MEMBERS_TABLE,
  type Member as MemberType,
} from '@/utils/queries/members';
import { getProfilePicture } from '@/utils/supabase/get-profile-picture';
import type { List } from '@/utils/queries/lists';
import { supabase } from '@/utils/supabase/create-browser-client';

interface Props {
  member: MemberType;
  list: List;
  showOptions?: boolean;
}

export function Member({ member, list, showOptions = true }: Props) {
  const { t } = useTranslation();

  const name = member.profile?.name;
  const email = member.profile?.email;

  const deleteMutation = useDeleteMutation(
    supabase.from(MEMBERS_TABLE),
    ['listId', 'profileId'],
    MEMBERS_COLUMNS_BASE
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 overflow-x-hidden">
        <Avatar
          name={name || undefined}
          color="initials"
          src={getProfilePicture(member.profile)}
        />
        <div className="flex flex-col overflow-x-hidden">
          <div className="truncate text-sm font-bold">{name || <NoName />}</div>
          <div className="text-dimmed truncate text-sm">{email}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <RoleBadge role={member.role} />
        {showOptions ? (
          <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            withArrow
            arrowPosition="center"
            offset={4}
          >
            <MenuTarget>
              <ActionIcon
                className="-mr-2"
                variant="subtle"
                color="gray"
                size="lg"
              >
                <DotsThreeOutlineVertical size="1rem" weight="fill" />
              </ActionIcon>
            </MenuTarget>

            <MenuDropdown>
              <MenuItem
                color="red"
                leftSection={<X size="1.125rem" />}
                disabled={member.role === 'owner'}
                onClick={() => {
                  modals.open({
                    centered: true,
                    withCloseButton: false,
                    children: (
                      <BaseModalContent
                        icon={<X />}
                        title={t({
                          pt: `Remover da lista`,
                          en: `Remove from list`,
                          es: `Eliminar de la lista`,
                        })}
                        description={t({
                          pt: `Tem certeza de que deseja remover o/a membro(a)${name ? ` "${name}"` : ''} da lista "${list.name}"?`,
                          en: `Are you sure you want to remove the member${name ? ` "${name}"` : ''} from the list "${list.name}"?`,
                          es: `¿Estás seguro de que quieres eliminar al/la miembro${name ? ` "${name}"` : ''} de la lista "${list.name}"?`,
                        })}
                        buttons={
                          <>
                            <Button
                              variant="default"
                              onClick={() => modals.closeAll()}
                            >
                              {t({
                                pt: 'Não remover',
                                en: "Don't remove it",
                                es: 'No eliminar',
                              })}
                            </Button>
                            <Button
                              color="red"
                              onClick={() => {
                                deleteMutation.mutate(member, {
                                  onSuccess: () => modals.closeAll(),
                                });
                              }}
                            >
                              {t({
                                pt: `Remover membro`,
                                en: `Remove member`,
                                es: `Eliminar miembro`,
                              })}
                            </Button>
                          </>
                        }
                        styles={{
                          iconWrapper: {
                            backgroundColor: 'var(--mantine-color-red-light)',
                            color: 'var(--mantine-color-red-light-color)',
                          },
                        }}
                      />
                    ),
                  });
                }}
              >
                {t({
                  pt: 'Remover membro',
                  en: 'Remove member',
                  es: 'Eliminar miembro',
                })}
              </MenuItem>
            </MenuDropdown>
          </Menu>
        ) : null}
      </div>
    </div>
  );
}
