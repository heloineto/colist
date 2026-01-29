import { boolean, number, object, string } from 'zod';
import { createDisclosureDbFormContext } from '@information-systems/mantine';
import type { TablesInsert } from '@/utils/supabase/database-types';

export const [useItemFormProvider, useItemForm, ItemFormProvider] =
  createDisclosureDbFormContext({
    initialValues: {
      id: null as number | null,
      name: '',
      detailsOpened: false,
      details: '',
      amount: 1,
      listId: null as number | null,
      categoryId: null as number | null,
    },
    getSchema: (t) => {
      return object({
        id: number().nullable(),
        name: string().min(
          1,
          t({
            pt: 'Por favor, forneça um nome',
            en: 'Please provide a name',
            es: 'Por favor, proporcione un nombre',
          })
        ),
        detailsOpened: boolean(),
        details: string(),
        amount: number().int().min(1),
        listId: number().int(),
        categoryId: number().int().nullable(),
      });
    },
    toDatabase: (values) => {
      const row: TablesInsert<'items'> = {
        name: values.name,
        listId: values.listId,
        details: values.details,
        amount: values.amount,
        categoryId: values.categoryId,
      };

      if (values.id !== null) {
        row.id = values.id;
      }

      return row;
    },
    fromDatabase: (row) => {
      return {
        id: row.id ?? null,
        name: row.name,
        detailsOpened: !!row.details,
        details: row.details ?? '',
        amount: row.amount ?? 1,
        listId: row.listId,
        categoryId: row.categoryId ?? null,
      };
    },
  });
