import { z } from 'zod';
import { createDisclosureDbFormContext } from '@/deprecated/packages/mantine';
import type { TablesInsert } from '@/deprecated/utils/supabase/database-types';

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
      return z.object({
        id: z.number().nullable(),
        name: z.string().min(1, {
          error: t({
            pt: 'Por favor, forneça um nome',
            en: 'Please provide a name',
            es: 'Por favor, proporcione un nombre',
          }),
        }),
        detailsOpened: z.boolean(),
        details: z.string(),
        amount: z.number().int().min(1),
        listId: z.number().int(),
        categoryId: z.number().int().nullable(),
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
