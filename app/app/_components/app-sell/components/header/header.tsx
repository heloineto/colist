import { useTranslation } from '@/deprecated/packages/translations';
import dynamic from 'next/dynamic';
import { AvatarLoading } from '@/deprecated/packages/uploader';
import { Badge } from '@mantine/core';
import { ShareButton } from '../share/components/share-button';
import { UPPER_HEADER_HEIGHT } from '../../utils/constants';
import { SearchAffix } from '../search-affix';
import { ListTabs } from './components/list-tabs';

const Share = dynamic(() => import('../share').then((mod) => mod.Share), {
  loading: () => <ShareButton disabled />,
});

const UserMenu = dynamic(
  () => import('../user-menu').then((mod) => mod.UserMenu),
  { loading: () => <AvatarLoading /> }
);

export function Header() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div
        className="grid grid-cols-3 px-2 pt-2"
        style={{ height: UPPER_HEADER_HEIGHT }}
      >
        <div className="flex items-center justify-start">
          <Share />
        </div>
        <div className="flex items-center justify-center gap-1 text-xl font-semibold">
          {t({ pt: 'Listas', en: 'Lists', es: 'Listas' })}
          <Badge variant="light" size="sm">
            Alpha
          </Badge>
        </div>
        <div className="flex items-center justify-end">
          <UserMenu />
        </div>
      </div>
      <ListTabs />
      <SearchAffix />
    </div>
  );
}
