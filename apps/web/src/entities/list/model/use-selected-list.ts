import { useEffect } from 'react';
import { useLists } from '@/shared/api/generated/lists/lists';
import { useSelectedListId } from '@/shared/lib/preferences';

/** Lists query + persisted selection; auto-selects the first list and drops a vanished one. */
export function useSelectedList() {
  const listsQuery = useLists();
  const [listId, setListId] = useSelectedListId();
  const lists = listsQuery.data;
  const selected = lists?.find((list) => list.id === listId) ?? null;

  useEffect(() => {
    if (!lists) return;
    if (listId !== null && !lists.some((list) => list.id === listId)) {
      setListId(null);
    }
    if (listId === null && lists[0]) setListId(lists[0].id);
  }, [lists, listId, setListId]);

  return {
    listsQuery,
    lists,
    listId: selected?.id ?? null,
    list: selected,
    setListId,
  };
}
