import type { OptionsData } from '@mantine/core';
import {
  CheckIcon,
  ComboboxChevron,
  ComboboxOption,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  UnstyledButton,
  isOptionsGroup,
} from '@mantine/core';
import classes from '../select-list.module.css';
import { isValueChecked } from '../utils/is-value-checked';

export interface SelectListOptionProps {
  data: OptionsData[number];
  value?: string | string[] | null;
}

export function SelectListOption({ data, value }: SelectListOptionProps) {
  if (!isOptionsGroup(data)) {
    const checked = isValueChecked(value, data.value);
    const check = checked ? <CheckIcon className={classes.checkIcon} /> : null;

    return (
      <ComboboxOption
        value={data.value}
        className={classes.option}
        disabled={data.disabled}
        data-checked={checked || undefined}
        aria-selected={checked}
        active={checked}
      >
        {check}
        <span>{data.label}</span>
      </ComboboxOption>
    );
  }

  const isChildChecked = data.items.some((item) =>
    isValueChecked(value, item.value)
  );

  return (
    <Popover
      position="right-start"
      offset={{ mainAxis: 14, crossAxis: 0 }}
      withinPortal={false}
    >
      <PopoverTarget>
        <UnstyledButton className={classes.groupLabel}>
          <div className={classes.option}>
            {isChildChecked ? (
              <CheckIcon className={classes.checkIcon} />
            ) : null}
            {data.group}
          </div>
          <ComboboxChevron />
        </UnstyledButton>
      </PopoverTarget>
      <PopoverDropdown px="xs">
        {data.items.map((item) => (
          <SelectListOption data={item} value={value} key={item.value} />
        ))}
      </PopoverDropdown>
    </Popover>
  );
}
