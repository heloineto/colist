import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Tooltip } from '@mantine/core';
import { ListPlusIcon } from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { useItemForm } from '@/app/app/utils/item-form-context';

interface Props {
  onClick: () => void;
}

export function DetailsButton({ onClick }: Props) {
  const { t } = useTranslation();

  const itemForm = useItemForm();
  const detailsOpened = useWatch({
    control: itemForm.control,
    name: 'detailsOpened',
  });

  return (
    <Tooltip
      label={t({
        pt: 'Adicionar detalhes',
        en: 'Add details',
        es: 'Agregar detalles',
      })}
    >
      <ActionIcon
        variant="subtle"
        size="lg"
        ml={-9}
        color="gray"
        onClick={() => {
          if (detailsOpened) {
            itemForm.setValue('details', '');
            itemForm.setValue('detailsOpened', false);
            onClick();
          } else {
            itemForm.setValue('detailsOpened', true);
          }
        }}
      >
        <ListPlusIcon size="1.25rem" />
      </ActionIcon>
    </Tooltip>
  );
}
