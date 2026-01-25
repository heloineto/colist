'use client';

import { useTranslation } from '@information-systems/translations';
import { Button, Skeleton } from '@mantine/core';
import { Plus, ShoppingCart } from '@phosphor-icons/react/dist/ssr';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useQuery,
  useSubscription,
} from '@supabase-cache-helpers/postgrest-react-query';
import { QueryBoundary } from '@information-systems/states';
import { keepPreviousData } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import { Items } from '../items';
import { useItemForm } from '../../_utils/item-form-context';
import { useOptionsForm } from '../../_utils/options-form-context';
import { ItemForm } from '../item-form';
import { ITEMS_COLUMNS, ITEMS_TABLE } from '@/utils/queries/items';
import { supabase } from '@/utils/supabase/create-browser-client';
import type { List } from '@/utils/queries/lists';

interface Props {
  listId: number | null;
}

export function List({ listId }: Props) {
  const { t } = useTranslation();
  const itemForm = useItemForm();

  const optionsForm = useOptionsForm();
  const search = useWatch({ control: optionsForm.control, name: 'search' });
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const orderBy = useWatch({ control: optionsForm.control, name: 'orderBy' });
  const orderDirection = useWatch({
    control: optionsForm.control,
    name: 'orderDirection',
  });

  const itemsQuery = useQuery(
    supabase
      .from(ITEMS_TABLE)
      .select(ITEMS_COLUMNS)
      .eq('listId', listId as number)
      .or(
        `name.ilike.%${debouncedSearch.trim()}%, details.ilike.%${debouncedSearch.trim()}%`
      )
      .order(orderBy, { ascending: orderDirection === 'ascending' }),
    { enabled: !!listId, placeholderData: keepPreviousData }
  );

  useSubscription(
    supabase,
    ITEMS_TABLE,
    { event: '*', table: ITEMS_TABLE, schema: 'public' },
    ['id'],
    {
      callback: () => {
        itemsQuery.refetch();
      },
    }
  );

  return (
    <>
      <QueryBoundary
        query={itemsQuery}
        loadingComponent={
          <>
            {Array.from({ length: 11 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key --- This is fine because the array is static
                key={index}
                className="p-sm flex items-center justify-between"
              >
                <div className="gap-md flex items-center">
                  <Skeleton className="shrink-0" h={28} w={28} circle />
                  <Skeleton h={18} w={100} />
                </div>
                <Skeleton h={20} w={31} circle />
              </div>
            ))}
          </>
        }
        errorProps={{
          title: t({
            pt: 'Erro ao carregar itens',
            en: 'Error loading items',
            es: 'Error al cargar los artículos',
          }),
          radius: 0,
          className: 'grow',
        }}
        withEmptyState
        emptyProps={{
          icon: <ShoppingCart />,
          hasFilters: !!search,
          button: search ? (
            <Button
              size="sm"
              onClick={() => optionsForm.setValue('searchOpened', false)}
              variant="light"
            >
              {t({
                pt: 'Remover filtros',
                en: 'Remove filters',
                es: 'Eliminar filtros',
              })}
            </Button>
          ) : (
            <Button
              size="sm"
              leftSection={<Plus size="1rem" weight="bold" />}
              onClick={itemForm.disclosure.open}
              variant="light"
            >
              {t({
                pt: 'Adicionar item',
                en: 'Add item',
                es: 'Añadir artículo',
              })}
            </Button>
          ),
        }}
      >
        {(query) => <Items items={query.data} />}
      </QueryBoundary>
      <ItemForm />
    </>
  );
}
