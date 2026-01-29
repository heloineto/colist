import type { TFunction } from '@/deprecated/packages/translations';
import { useTranslation } from '@/deprecated/packages/translations';
import type { SelectProps } from '@mantine/core';
import { CheckIcon, ColorSwatch, Select } from '@mantine/core';
import { useMemo } from 'react';

interface GetColorsOptions {
  includeGray?: boolean;
  includeDark?: boolean;
  sortAlphabetically?: boolean;
}

export const defaultColors = [
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
  'gray',
  'dark',
] as const;

export function getColors(
  t: TFunction,
  {
    includeGray = false,
    includeDark = false,
    sortAlphabetically = false,
  }: GetColorsOptions = {
    includeGray: false,
    includeDark: false,
    sortAlphabetically: false,
  }
) {
  // prettier-ignore
  let colors = [
    { value: 'red', label: t({ pt: 'Vermelho', en: 'Red', es: 'Rojo' }) },
    { value: 'pink', label: t({ pt: 'Rosa', en: 'Pink', es: 'Rosa' }) },
    { value: 'grape', label: t({ pt: 'Uva', en: 'Grape', es: 'Uva' }) },
    { value: 'violet', label: t({ pt: 'Violeta', en: 'Violet', es: 'Violeta' }) },
    { value: 'indigo', label: t({ pt: 'Índigo', en: 'Indigo', es: 'Índigo' }) },
    { value: 'blue', label: t({ pt: 'Azul', en: 'Blue', es: 'Azul' }) },
    { value: 'cyan', label: t({ pt: 'Ciano', en: 'Cyan', es: 'Cian' }) },
    { value: 'teal', label: t({ pt: 'Azul-Verde', en: 'Teal', es: 'Azul verdoso' }) },
    { value: 'green', label: t({ pt: 'Verde', en: 'Green', es: 'Verde' }) },
    { value: 'lime', label: t({ pt: 'Limão', en: 'Lime', es: 'Lima' }) },
    { value: 'yellow', label: t({ pt: 'Amarelo', en: 'Yellow', es: 'Amarillo' }) },
    { value: 'orange', label: t({ pt: 'Laranja', en: 'Orange', es: 'Naranja' }) },
  ];

  if (includeGray) {
    colors.push({
      value: 'gray',
      label: t({ pt: 'Cinza', en: 'Gray', es: 'Gris' }),
    });
  }

  if (includeDark) {
    colors.push({
      value: 'dark',
      label: t({ pt: 'Escuro', en: 'Dark', es: 'Oscuro' }),
    });
  }

  if (sortAlphabetically) {
    colors = colors.sort((a, b) => a.label.localeCompare(b.label));
  }

  return colors;
}

const renderOption: SelectProps['renderOption'] = ({ option, checked }) => (
  <div className="gap-xs flex grow items-center">
    <ColorSwatch
      color={`var(--mantine-color-${option.value}-filled`}
      size="1.125rem"
    />
    {option.label}
    {checked ? (
      <CheckIcon
        style={{ marginInlineStart: 'auto' }}
        opacity={0.4}
        size="0.8em"
      />
    ) : null}
  </div>
);

export interface ColorSelectProps extends SelectProps, GetColorsOptions {}

export function ColorSelect({
  value,
  includeGray,
  includeDark,
  sortAlphabetically,
  ...rest
}: ColorSelectProps) {
  const { t } = useTranslation();
  const data = useMemo(
    () => getColors(t, { includeGray, includeDark, sortAlphabetically }),
    [includeDark, includeGray, sortAlphabetically, t]
  );

  return (
    <Select
      value={value}
      data={data}
      leftSection={
        <ColorSwatch
          color={`var(--mantine-color-${value}-filled`}
          size="1.125rem"
        />
      }
      renderOption={renderOption}
      {...rest}
    />
  );
}
