import { SelectList as OriginalSelectList } from '@/deprecated/packages/mantine';
import { useTranslation } from '@/deprecated/packages/translations';
import {
  ActionIcon,
  Divider,
  Drawer,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Tooltip,
  NavLink,
} from '@mantine/core';
import { ArrowsDownUpIcon, ShapesIcon } from '@phosphor-icons/react/dist/ssr';
import { useUncontrolled } from '@mantine/hooks';
import { useMemo } from 'react';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { useOptionsForm } from '@/app/app/utils/options-form-context';

const SelectList = withController(OriginalSelectList);

interface Props {
  mode?: 'nav' | 'footer';
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (value: boolean) => void;
}

export function SortButton({
  mode = 'footer',
  onChange,
  defaultOpened,
  opened,
}: Props) {
  const { t } = useTranslation();
  const optionsForm = useOptionsForm();
  const [_opened, handleChange] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });

  const orderByData = useMemo(
    () => [
      { label: t({ pt: 'Nome', en: 'Name', es: 'Nombre' }), value: 'name' },
      {
        label: t({
          pt: 'Data de modificação',
          en: 'Modification date',
          es: 'Fecha de modificación',
        }),
        value: 'updated',
      },
    ],
    [t]
  );

  const orderData = useMemo(
    () => [
      {
        label: t({
          pt: 'Ordem Crescente',
          en: 'Ascending order',
          es: 'Orden ascendente',
        }),
        value: 'ascending',
      },
      {
        label: t({
          pt: 'Ordem Decrescente',
          en: 'Descending order',
          es: 'Orden descendente',
        }),
        value: 'descending',
      },
    ],
    [t]
  );

  const groupByData = useMemo(
    () => [
      {
        label: t({ pt: 'Nenhum', en: 'None', es: 'Ninguno' }),
        value: 'none',
      },
      {
        label: t({ pt: 'Categoria', en: 'Category', es: 'Categoría' }),
        value: 'category',
      },
    ],
    [t]
  );

  const label = t({ pt: 'Ordenar por', en: 'Sort by', es: 'Ordenar por' });

  const content = (
    <>
      <div className="mt-0.5 mb-1 flex items-center gap-1.5 font-medium">
        <ArrowsDownUpIcon size="1.125rem" weight="bold" />
        {t({ pt: 'Ordenar por', en: 'Sort by', es: 'Ordenar por' })}
      </div>
      <SelectList
        allowDeselect={false}
        className="ml-[-10px]"
        data={orderByData}
        name="orderBy"
        control={optionsForm.control}
      />
      <Divider
        className="my-1"
        labelPosition="left"
        label={t({ pt: 'Direção', en: 'Direction', es: 'Dirección' })}
      />
      <SelectList
        allowDeselect={false}
        className="ml-[-10px]"
        data={orderData}
        name="orderDirection"
        control={optionsForm.control}
      />
      <Divider className="my-2" />
      <div className="mb-1 flex items-center gap-1.5 font-medium">
        <ShapesIcon size="1.125rem" weight="bold" />
        {t({ pt: 'Agrupar por', en: 'Group by', es: 'Agrupar por' })}
      </div>
      <SelectList
        allowDeselect={false}
        className="ml-[-10px]"
        data={groupByData}
        name="groupBy"
        control={optionsForm.control}
      />
    </>
  );

  if (mode === 'nav') {
    return (
      <Popover
        width={200}
        position="right-start"
        arrowPosition="center"
        withArrow
        shadow="md"
        offset={-4}
        opened={_opened}
        onChange={handleChange}
      >
        <PopoverTarget>
          <NavLink
            label={label}
            component="button"
            leftSection={<ArrowsDownUpIcon size="1.25rem" />}
            onClick={() => handleChange(!_opened)}
          />
        </PopoverTarget>
        <PopoverDropdown>{content}</PopoverDropdown>
      </Popover>
    );
  }

  return (
    <>
      <Tooltip label={label} openDelay={0}>
        <ActionIcon
          variant="subtle"
          size="2.25rem"
          color="gray"
          radius="md"
          onClick={() => handleChange(!_opened)}
        >
          <ArrowsDownUpIcon size="1.375rem" />
        </ActionIcon>
      </Tooltip>
      <Drawer
        opened={_opened}
        onClose={() => handleChange(false)}
        position="bottom"
        size={338}
        withCloseButton={false}
        classNames={{ content: '!rounded-t-lg', body: '!p-md' }}
      >
        {content}
      </Drawer>
    </>
  );
}
