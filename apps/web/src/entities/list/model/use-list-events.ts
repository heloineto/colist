import { useEffect } from 'react';
import { invalidateList } from '@/entities/list/model/invalidate';
import { queryClient } from '@/shared/api/query-client';

type ListChanged = { listId: number };

/** Per-user SSE stream: `list.changed` → invalidate that list; (re)connect → blanket invalidate. */
export function useListEvents() {
  useEffect(() => {
    const source = new EventSource('/api/events', { withCredentials: true });
    source.onopen = () => void queryClient.invalidateQueries();
    source.addEventListener('list.changed', (event: MessageEvent<string>) => {
      const { listId } = JSON.parse(event.data) as ListChanged;
      invalidateList(listId);
    });
    return () => source.close();
  }, []);
}
