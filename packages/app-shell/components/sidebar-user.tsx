'use client';

import { useUncontrolled } from '@mantine/hooks';
import {
  Avatar,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Skeleton,
} from '@mantine/core';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr';
import { ColorSchemeMenuItems } from './color-scheme-menu-items';
import classes from './sidebar-user.module.css';
import type { Query } from '@/packages/states';
import { QueryBoundary, AvatarError, AvatarLoading } from '@/packages/states';
import { SignOutMenuItem } from './sign-out-menu-item';
import { cn } from '@/packages/utils';

export interface SidebarUserProps {
  opened?: boolean;
  onChange?: (opened: boolean) => void;
  onOpenSettings?: () => void;
  query: Query;
  name?: string | null;
  email?: string | null;
  profilePicture?: string | null;
  onSignOut: () => Promise<void>;
}

export function SidebarUser({
  opened: openedProp,
  onChange: onChangeProp,
  onOpenSettings,
  query,
  name,
  email,
  profilePicture,
  onSignOut,
}: SidebarUserProps) {
  const [opened, onChange] = useUncontrolled({
    defaultValue: false,
    finalValue: false,
    value: openedProp,
    onChange: onChangeProp,
  });

  return (
    <Menu position="top-start" opened={opened} onChange={onChange}>
      <MenuTarget>
        <button
          type="button"
          data-opened={opened}
          className={cn('mantine-focus-auto', classes.userNavButton)}
        >
          <QueryBoundary
            query={query}
            loadingComponent={<AvatarLoading />}
            errorComponent={<AvatarError />}
          >
            {() => {
              return (
                <Avatar
                  color="initials"
                  name={name || undefined}
                  src={profilePicture}
                  alt={`Foto de perfil de ${name}`}
                />
              );
            }}
          </QueryBoundary>
          <div className="relative h-9.5 grow">
            <div className="absolute top-0 left-0 flex size-full grow flex-col justify-center">
              <QueryBoundary
                query={query}
                loadingComponent={
                  <>
                    <Skeleton h={12} my={4} w="60%" />
                    <Skeleton h={10} my={4} w="90%" />
                  </>
                }
                errorComponent={
                  <div className="bg-red-light text-red-5 truncate rounded p-2 text-xs font-semibold">
                    Erro ao carregar perfil
                  </div>
                }
              >
                {() => (
                  <>
                    <div className="truncate text-sm font-medium">
                      {name || (
                        <span className="text-dimmed italic">Sem nome</span>
                      )}
                    </div>
                    <div className="text-dimmed truncate text-xs">
                      {email ?? (
                        <span className="text-red-5">
                          Erro ao carregar e-mail
                        </span>
                      )}
                    </div>
                  </>
                )}
              </QueryBoundary>
            </div>
          </div>
        </button>
      </MenuTarget>
      <MenuDropdown w={250}>
        <MenuItem
          leftSection={<GearSixIcon size={18} />}
          onClick={onOpenSettings}
          h="2.25rem"
        >
          Configurações
        </MenuItem>
        <MenuDivider />
        <ColorSchemeMenuItems />
        <MenuDivider />
        <SignOutMenuItem
          onSignOut={onSignOut}
          variant="subtle"
          color="red"
          h="2.25rem"
          classNames={{
            root: '!w-full',
            label: 'font-normal',
          }}
          tabIndex={-1}
          role="menuitem"
          data-menu-item="true"
        />
      </MenuDropdown>
    </Menu>
  );
}
