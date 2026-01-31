import {
  useDeleteMutation,
  type UseQuerySingleReturn,
} from '@supabase-cache-helpers/postgrest-react-query';
import { QueryBoundary } from '@/deprecated/packages/states';
import { useTranslation } from '@/deprecated/packages/translations';
import { PlusIcon, TagIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr';
import { ActionIcon, Button, Highlight, Radio, Skeleton } from '@mantine/core';
import type { Disclosure } from '@/deprecated/packages/mantine';
import type { RefObject } from 'react';
import { openDeleteModal } from '@/deprecated/packages/mantine';
import { RadioGroup } from '@/deprecated/packages/mantine-hook-form';
import { CategoryCreateButton } from './category-create-button';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_TABLE,
  type Category,
} from '@/deprecated/utils/queries/categories';
import { useItemForm } from '@/app/app/utils/item-form-context';
import { random } from '@/deprecated/utils/other/random';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';

interface Props {
  query: UseQuerySingleReturn<Category[]>;
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  disclosure: Disclosure;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function CategoryRadioGroup({
  query,
  search,
  debouncedSearch,
  setSearch,
  disclosure,
  inputRef,
}: Props) {
  const itemForm = useItemForm();
  const { t } = useTranslation();
  const deleteMutation = useDeleteMutation(
    supabase.from(CATEGORIES_TABLE),
    ['id'],
    CATEGORIES_COLUMNS
  );

  return (
    <RadioGroup
      px="md"
      name="categoryId"
      control={itemForm.control}
      size="md"
      transformValue={(value) => Number(value)}
      onChange={disclosure.close}
    >
      <div className="gap-sm pb-md flex flex-col">
        {search ? (
          <CategoryCreateButton
            search={search}
            setSearch={setSearch}
            disclosure={disclosure}
          />
        ) : null}
        {
          <QueryBoundary
            query={query}
            errorTitle={t({
              pt: 'Erro ao buscar categorias',
              en: 'Error fetching categories',
              es: 'Error al buscar categorías',
            })}
            loadingComponent={
              <div className="flex flex-col">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    className="mb-sm gap-sm flex items-center last:mb-0"
                    // eslint-disable-next-line react/no-array-index-key --- This is fine since the array is static
                    key={index}
                  >
                    <Skeleton circle h={21} w={21} />
                    <Skeleton w={random(index, 100, 200)} h={16} />
                  </div>
                ))}
              </div>
            }
            withEmptyState
            emptyProps={{
              icon: <TagIcon />,
              size: 'sm',
              hasFilters: !!debouncedSearch,
              title: !debouncedSearch
                ? t({
                    pt: 'Nenhuma categoria',
                    en: 'No categories',
                    es: 'No se encontraron',
                  })
                : t({
                    pt: 'Nenhuma categoria encontrada',
                    en: 'No categories found',
                    es: 'No se encontraron categorías',
                  }),
              description: !debouncedSearch
                ? t({
                    pt: 'Adicione uma nova categoria',
                    en: 'Add a new category',
                    es: 'Añadir una nueva categoría',
                  })
                : t({
                    pt: 'Tente modificar a pesquisa, ou criar uma nova categoria',
                    en: 'Try modifying the search, or create a new category',
                    es: 'Intenta modificar la búsqueda o crear una nueva categoría',
                  }),
              button: !debouncedSearch ? (
                <Button
                  variant="light"
                  onClick={() => inputRef.current?.focus()}
                  leftSection={<PlusIcon size="1rem" />}
                >
                  {t({
                    pt: 'Adicionar categoria',
                    en: 'Add category',
                    es: 'Añadir categoría',
                  })}
                </Button>
              ) : (
                <Button variant="light" onClick={() => setSearch('')}>
                  {t({
                    pt: 'Remover filtros',
                    en: 'Remove filters',
                    es: 'Eliminar filtros',
                  })}
                </Button>
              ),
            }}
          >
            {({ data: categories }) => (
              <>
                {categories.map((category) => (
                  <div
                    className="flex items-center justify-between"
                    key={category.id}
                  >
                    <Radio
                      classNames={{
                        root: 'grow',
                        body: 'items-center',
                        label: 'grow',
                      }}
                      value={category.id}
                      label={
                        <Highlight highlight={search}>
                          {category.name}
                        </Highlight>
                      }
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        openDeleteModal({
                          label: {
                            gender: 'feminine',
                            singular: t({
                              pt: `categoria "${category.name}"`,
                              en: `category "${category.name}"`,
                              es: `categoría "${category.name}"`,
                            }),
                          },
                          onConfirm: () => {
                            deleteMutation.mutate(category, {
                              onSuccess: () => {
                                const currentId =
                                  itemForm.getValues('categoryId');

                                if (category.id === currentId) {
                                  itemForm.setValue('categoryId', null);
                                }
                              },
                            });
                          },
                        });
                      }}
                    >
                      <TrashIcon size="1rem" />
                    </ActionIcon>
                  </div>
                ))}
              </>
            )}
          </QueryBoundary>
        }
      </div>
    </RadioGroup>
  );
}
