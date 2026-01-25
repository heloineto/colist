import { useDisclosure } from '@information-systems/mantine';
import { useTranslation } from '@information-systems/translations';
import { ActionIcon, Modal, Tooltip } from '@mantine/core';
import { Tag } from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { CategoryModalContent } from './category-modal-content';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_TABLE,
} from '@/utils/queries/categories';
import { supabase } from '@/utils/supabase/create-browser-client';

export function CategoryButton() {
  const { t } = useTranslation();
  const disclosure = useDisclosure();
  const itemForm = useItemForm();

  const categoryId = useWatch({
    control: itemForm.control,
    name: 'categoryId',
  });

  const categoryQuery = useQuery(
    supabase
      .from(CATEGORIES_TABLE)
      .select(CATEGORIES_COLUMNS)
      .eq('id', categoryId as number),
    {
      enabled: !!categoryId,
    }
  );

  return (
    <>
      <Tooltip
        label={
          categoryId
            ? t({
                pt: 'Mudar categoria',
                en: 'Change category',
                es: 'Cambiar categoría',
              })
            : t({
                pt: 'Adicionar categoria',
                en: 'Add category',
                es: 'Añadir categoría',
              })
        }
      >
        <ActionIcon
          className="!w-auto !px-1.5"
          variant="subtle"
          size="lg"
          color="gray"
          onClick={disclosure.open}
        >
          <Tag size="1.25rem" />
          {categoryQuery.data?.[0] ? (
            <p className="ml-1.5 max-w-28 truncate text-sm text-dimmed">
              {categoryQuery.data[0].name}
            </p>
          ) : null}
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={disclosure.opened}
        onClose={disclosure.close}
        withCloseButton={false}
        classNames={{ body: '!p-0' }}
        centered={false}
      >
        <CategoryModalContent disclosure={disclosure} />
      </Modal>
    </>
  );
}
