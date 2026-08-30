import { Badge, ScrollArea, Skeleton, Tabs } from '@mantine/core';
import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useSelectedList } from '@/entities/list';
import { useListForm } from '@/features/lists';

const NEW = 'new';

export function ListTabs() {
  const { t } = useTranslation();
  const { lists, listId, setListId } = useSelectedList();
  const listForm = useListForm();

  if (!lists) {
    return (
      <div className="flex h-12 items-center gap-6 px-4 py-2">
        {[80, 70, 90, 60].map((width) => (
          <Skeleton key={width} h={16} w={width} />
        ))}
      </div>
    );
  }

  return (
    <Tabs
      h="3rem"
      value={listId === null ? null : String(listId)}
      onChange={(value) => {
        if (value === NEW) return listForm.open();
        setListId(value === null ? null : Number(value));
      }}
    >
      <ScrollArea type="never" w="100vw">
        <Tabs.List className="mt-2 flex-nowrap!">
          {lists.map((list) => (
            <Tabs.Tab key={list.id} value={String(list.id)} h={40} classNames={{ tabLabel: 'flex items-center gap-1' }}>
              {list.name}
              {list.uncheckedCount > 0 && (
                <Badge className="w-7! p-0!" variant="light" size="sm" color="gray">
                  {list.uncheckedCount}
                </Badge>
              )}
            </Tabs.Tab>
          ))}
          <Tabs.Tab value={NEW} h={40} leftSection={<PlusIcon size="0.75rem" weight="bold" />}>
            {t('shell.newList')}
          </Tabs.Tab>
        </Tabs.List>
      </ScrollArea>
    </Tabs>
  );
}
