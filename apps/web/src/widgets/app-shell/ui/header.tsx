import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { ShareButton } from '@/features/members';
import { UserMenu } from '@/features/profile';
import { ListTabs } from '@/widgets/app-shell/ui/list-tabs';
import { SearchAffix } from '@/widgets/app-shell/ui/search-affix';

export function Header() {
  const { t } = useTranslation();
  const { list } = useSelectedList();

  return (
    <div className="flex flex-col">
      <div className="grid h-12 grid-cols-3 items-center px-2 pt-2">
        <div className="flex justify-start">
          <ShareButton list={list} />
        </div>
        <p className="text-center text-xl font-semibold">{t('shell.lists')}</p>
        <div className="flex justify-end">
          <UserMenu />
        </div>
      </div>
      <ListTabs />
      <SearchAffix />
    </div>
  );
}
