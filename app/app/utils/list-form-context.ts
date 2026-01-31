import { createDisclosureDbFormContext } from '@/deprecated/packages/mantine';
import { z } from 'zod';
import type { TablesInsert } from '@/deprecated/utils/supabase/database-types';

export const [useListFormProvider, useListForm, ListFormProvider] =
  createDisclosureDbFormContext({
    initialValues: {
      id: null as number | null,
      name: '',
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
      });
    },
    toDatabase: (values) => {
      const row: TablesInsert<'lists'> = {
        name: values.name,
      };

      if (values.id) {
        row.id = values.id;
      }

      return row;
    },
    fromDatabase: (row) => {
      return {
        id: row.id === undefined ? null : row.id,
        name: row.name,
      };
    },
  });
