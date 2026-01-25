import { useTranslation } from '@information-systems/translations';
import { ActionIcon, Tooltip } from '@mantine/core';
import { ListPlus } from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { useItemForm } from '@/app/app/_utils/item-form-context';

interface Props {
  onClick: () => void;
}

export function DetailsButton({ onClick }: Props) {
  const { t } = useTranslation();

  const form = useItemForm();
  const detailsOpened = useWatch({
    control: form.control,
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
            form.setValue('details', '');
            form.setValue('detailsOpened', false);
            onClick();
          } else {
            form.setValue('detailsOpened', true);
          }
        }}
      >
        <ListPlus size="1.25rem" />
      </ActionIcon>
    </Tooltip>
  );
}
