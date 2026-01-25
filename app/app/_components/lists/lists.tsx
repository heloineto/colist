'use client';

import { EmptyState } from '@information-systems/states';
import { Plus, ShoppingCart } from '@phosphor-icons/react/dist/ssr';
import { useTranslation } from '@information-systems/translations';
import { Button } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useListContext } from '../../_utils/list-context';
import { useListForm } from '../../_utils/list-form-context';
import { List } from '../list';

export function Lists() {
  const { listId, listsQuery } = useListContext();
  const { t } = useTranslation();
  const listForm = useListForm();
  const previousRef = useRef<number | null>(null);

  useEffect(() => {
    previousRef.current = listId;
  }, [listId]);

  const direction = useMemo(() => {
    if (!listsQuery.data) return 'left';

    const currentIndex = listsQuery.data.findIndex((l) => l.id === listId);
    const previousIndex = listsQuery.data.findIndex(
      (l) => l.id === previousRef.current
    );

    return currentIndex > previousIndex ? 'left' : 'right';
  }, [listId, listsQuery.data]);

  if (listsQuery.data?.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title={t({
          pt: 'Nenhuma lista criada',
          en: 'No list created',
          es: 'Ninguna lista creada',
        })}
        description={t({
          pt: 'Crie uma nova lista clicando no botão abaixo',
          en: 'Create a new list by clicking the button below',
          es: 'Cree una nueva lista haciendo clic en el botón de abajo',
        })}
        button={
          <Button
            size="sm"
            leftSection={<Plus size="1rem" weight="bold" />}
            onClick={listForm.disclosure.open}
            variant="light"
          >
            {t({
              pt: 'Nova lista',
              en: 'New list',
              es: 'Nueva lista',
            })}
          </Button>
        }
      />
    );
  }

  if (!listId) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title={t({
          pt: 'Nenhuma lista selecionada',
          en: 'No list selected',
          es: 'Ninguna lista seleccionada',
        })}
        description={t({
          pt: 'Selecione uma lista na barra acima para ver os itens',
          en: 'Select a list in the bar above to see the items',
          es: 'Seleccione una lista en la barra de arriba para ver los artículos',
        })}
      />
    );
  }

  return (
    <div
      className="relative grow"
      style={
        {
          '--direction': direction === 'left' ? 1 : -1,
        } as CSSProperties
      }
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute top-0 flex size-full flex-col"
          key={listId}
          initial={{ left: 'calc(var(--direction) * 100%)' }}
          animate={{ left: '0%' }}
          exit={{ left: 'calc(var(--direction) * -100%)' }}
        >
          <List listId={listId} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
