import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { ErrorState } from '@information-systems/states';
import { useTranslation } from '@information-systems/translations';
import { Tag } from '@phosphor-icons/react/dist/ssr';
import { Divider, ScrollAreaAutosize, TextInput } from '@mantine/core';
import { useRef, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData } from '@tanstack/react-query';
import type { Disclosure } from '@information-systems/mantine';
import { CategoryRadioGroup } from './category-radio-group';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_TABLE,
} from '@/utils/queries/categories';
import { supabase } from '@/utils/supabase/create-browser-client';
import { useListContext } from '@/app/app/_utils/list-context';
import { ModalHeader } from '@/components/modal-header';

interface Props {
  disclosure: Disclosure;
}

export function CategoryModalContent({ disclosure }: Props) {
  const { listId } = useListContext();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoriesQuery = useQuery(
    supabase
      .from(CATEGORIES_TABLE)
      .select(CATEGORIES_COLUMNS)
      .eq('listId', listId as number)
      .ilike('name', `%${debouncedSearch.trim()}%`)
      .order('name'),
    { enabled: !!listId, placeholderData: keepPreviousData }
  );

  if (!listId) {
    return (
      <ErrorState
        title={t({
          pt: 'Não foi possível encontrar a lista selecionada',
          en: 'Could not find the selected list',
          es: 'No se pudo encontrar la lista seleccionada',
        })}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <ModalHeader
        className="p-md"
        icon={<Tag />}
        title={t({ pt: 'Categorias', en: 'Categories', es: 'Categorías' })}
        description={t({
          pt: 'Selecione uma categoria para o item',
          en: 'Select a category for the item',
          es: 'Seleccione una categoría para el artículo',
        })}
      />
      <Divider />
      <div className="flex p-md">
        <TextInput
          radius="xl"
          className="grow"
          placeholder={t({
            pt: 'Pesquisar ou adicionar categoria',
            en: 'Search or add category',
            es: 'Buscar o agregar categoría',
          })}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          type="search"
          ref={inputRef}
        />
      </div>
      <ScrollAreaAutosize mah="calc(100dvh - var(--modal-y-offset) * 2 - 142px)">
        <CategoryRadioGroup
          debouncedSearch={debouncedSearch}
          query={categoriesQuery}
          search={search}
          setSearch={setSearch}
          disclosure={disclosure}
          inputRef={inputRef}
        />
      </ScrollAreaAutosize>
    </div>
  );
}
