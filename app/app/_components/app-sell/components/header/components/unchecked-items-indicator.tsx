import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useMemo } from 'react';
import { Badge } from '@mantine/core';
import { supabase } from '@/utils/supabase/create-browser-client';
import { ITEMS_COLUMNS, ITEMS_TABLE } from '@/utils/queries/items';

interface Props {
  listId: number;
}

export function UncheckedItemsIndicator({ listId }: Props) {
  const itemsQuery = useQuery(
    supabase.from(ITEMS_TABLE).select(ITEMS_COLUMNS).eq('listId', listId)
  );

  const count = useMemo(() => {
    if (!itemsQuery.data) return 0;
    return itemsQuery.data.filter((item) => !item.checked).length;
  }, [itemsQuery.data]);

  if (count === 0) {
    return null;
  }

  return (
    <Badge className="w-7! p-0!" variant="light" size="sm" color="gray">
      {count}
    </Badge>
  );
}
