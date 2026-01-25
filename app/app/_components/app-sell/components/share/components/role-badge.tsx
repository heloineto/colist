import { useTranslation } from '@information-systems/translations';
import { Badge } from '@mantine/core';
import { CrownSimple } from '@phosphor-icons/react/dist/ssr';
import type { Enums } from '@/utils/supabase/database-types';

export interface RoleBadgeProps {
  role: Enums<'membersRole'>;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const { t } = useTranslation();

  const roleToName: Record<Enums<'membersRole'>, string> = {
    owner: t({ pt: 'Dono', en: 'Owner', es: 'Dueño' }),
    member: t({ pt: 'Membro', en: 'Member', es: 'Miembro' }),
  };

  const name = roleToName[role];

  const roleToColor: Record<Enums<'membersRole'>, string> = {
    owner: 'orange',
    member: 'blue',
  };

  const color = roleToColor[role];

  return (
    <Badge
      className="shrink-0"
      variant="light"
      color={color}
      classNames={{
        label: 'flex items-center gap-1',
      }}
    >
      {role === 'owner' ? <CrownSimple size="1rem" weight="fill" /> : null}
      {name}
    </Badge>
  );
}
