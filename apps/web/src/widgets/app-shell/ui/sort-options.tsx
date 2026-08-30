import { Divider, Radio } from '@mantine/core';
import { ArrowsDownUpIcon, ShapesIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { type ListOptions, useListOptions } from '@/shared/lib/preferences';

function OptionGroup<Key extends keyof ListOptions>({
  option,
  values,
  label,
}: {
  option: Key;
  values: ListOptions[Key][];
  label: (value: ListOptions[Key]) => string;
}) {
  const [options, setOptions] = useListOptions();
  return (
    <Radio.Group
      value={options[option]}
      onChange={(value) => setOptions({ ...options, [option]: value })}
    >
      <div className="flex flex-col gap-2 py-2">
        {values.map((value) => (
          <Radio key={value} value={value} label={label(value)} />
        ))}
      </div>
    </Radio.Group>
  );
}

export function SortOptions() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <p className="flex items-center gap-1 font-semibold">
        <ArrowsDownUpIcon size="1.125rem" weight="bold" /> {t('shell.sortBy')}
      </p>
      <OptionGroup option="sort" values={['name', 'updatedAt']} label={(value) => t(`shell.sort.${value}`)} />
      <Divider label={t('shell.direction')} labelPosition="left" />
      <OptionGroup option="order" values={['asc', 'desc']} label={(value) => t(`shell.order.${value}`)} />
      <Divider />
      <p className="mt-2 flex items-center gap-1 font-semibold">
        <ShapesIcon size="1.125rem" weight="bold" /> {t('shell.groupBy')}
      </p>
      <OptionGroup option="groupBy" values={['none', 'category']} label={(value) => t(`shell.group.${value}`)} />
    </div>
  );
}
