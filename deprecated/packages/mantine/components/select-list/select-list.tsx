import type { BoxProps, ComboboxData } from '@mantine/core';
import {
  Box,
  Combobox,
  ComboboxOptions,
  InputError,
  getParsedComboboxData,
  isOptionsGroup,
  useCombobox,
} from '@mantine/core';
import type { ComponentPropsWithoutRef, ForwardedRef } from 'react';
import { forwardRef, useMemo } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import { SelectListOption } from './components/select-list-option';
import classes from './select-list.module.css';

export interface SelectListProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<'div'>,
      keyof BoxProps | 'onChange' | 'defaultValue'
    > {
  value?: string | null;
  defaultValue?: string | null;
  error?: string | null;
  onChange?: (value: string | null) => void;
  data: ComboboxData;
  allowDeselect?: boolean;
}

// FUTURE: Make this component fully accessible with keyboard (a11y)
export const SelectList = forwardRef(function SelectList(
  {
    data,
    value,
    error,
    onChange,
    defaultValue,
    allowDeselect = true,
    ...rest
  }: SelectListProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const combobox = useCombobox();
  const parsedData = useMemo(() => getParsedComboboxData(data), [data]);

  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange,
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(newValue: string) => {
        let parsedValue;

        if (allowDeselect) {
          parsedValue = value === newValue ? null : newValue;
        } else {
          parsedValue = newValue;
        }

        handleChange(parsedValue);
      }}
    >
      <Box ref={ref} {...rest}>
        <ComboboxOptions className={classes.options}>
          {parsedData.length > 0 ? (
            parsedData.map((item) => (
              <SelectListOption
                data={item}
                key={isOptionsGroup(item) ? item.group : item.value}
                value={_value}
              />
            ))
          ) : (
            <Combobox.Empty>Nada encontrado....</Combobox.Empty>
          )}
        </ComboboxOptions>
      </Box>
      {error ? <InputError>{error}</InputError> : null}
    </Combobox>
  );
});
