import { ScrollArea, Skeleton, Tabs, TabsList, TabsTab } from '@mantine/core';
import { useTranslation } from '@/deprecated/packages/translations';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr';
import { QueryBoundary } from '@/deprecated/packages/states';
import { useEffect } from 'react';
import { LIST_TABS_HEIGHT } from '../../../utils/constants';
import { UncheckedItemsIndicator } from './unchecked-items-indicator';
import { useListForm } from '@/app/app/utils/list-form-context';
import { useListContext } from '@/app/app/utils/list-context';

export function ListTabs() {
  const { t } = useTranslation();
  const listForm = useListForm();
  const { listId, setListId, listsQuery } = useListContext();

  useEffect(() => {
    const lists = listsQuery.data;
    if (!lists) return;

    if (listId === null) {
      const firstId = lists.length > 0 ? lists[0].id : null;
      setListId(firstId);
    } else {
      const exists = lists.some((list) => list.id === listId);
      if (!exists) setListId(null);
    }
  }, [setListId, listId, listsQuery.data]);

  return (
    <Tabs
      h={LIST_TABS_HEIGHT}
      value={String(listId)}
      onChange={(value: string | null) => {
        if (value !== 'new') setListId(Number(value));
      }}
    >
      <ScrollArea type="never" w="100vw">
        <TabsList className="mt-2 !flex-nowrap">
          <QueryBoundary
            query={listsQuery}
            loadingComponent={
              <div className="gap-lg px-md py-xs flex items-center">
                <Skeleton w={80} h={16} />
                <Skeleton w={70} h={16} />
                <Skeleton w={90} h={16} />
                <Skeleton w={60} h={16} />
              </div>
            }
            errorTitle={t({
              pt: 'Erro ao carregar listas',
              en: 'Error loading lists',
              es: 'Error al cargar las listas',
            })}
            errorProps={{
              radius: 0,
              classNames: {
                root: 'flex items-center min-w-[350px] !py-0 !px-2 !rounded-tr-md',
                wrapper: 'flex items-center grow',
                body: '!flex-row justify-between',
                icon: '!mt-0',
              },
            }}
          >
            {(query) =>
              query.data.map((list) => (
                <TabsTab
                  h={40}
                  value={String(list.id)}
                  key={list.id}
                  classNames={{ tabLabel: 'flex items-center gap-1' }}
                >
                  {list.name}
                  <UncheckedItemsIndicator listId={list.id} />
                </TabsTab>
              ))
            }
          </QueryBoundary>
          <TabsTab
            h={40}
            value="new"
            leftSection={<PlusIcon size="0.75rem" weight="bold" />}
            onClick={() => {
              listForm.reset(listForm.initialValues);
              listForm.disclosure.open();
            }}
          >
            {t({ pt: 'Nova lista', en: 'New list', es: 'Nueva lista' })}
          </TabsTab>
        </TabsList>
      </ScrollArea>
    </Tabs>
  );
}
