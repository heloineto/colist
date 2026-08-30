import { useLocalStorage } from '@mantine/hooks';
import type { MantineColor } from '@mantine/core';

export const PRIMARY_COLORS = [
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
] as const satisfies MantineColor[];
export type PrimaryColor = (typeof PRIMARY_COLORS)[number];

export function usePrimaryColor() {
  return useLocalStorage<PrimaryColor>({
    key: 'primary-color',
    defaultValue: 'green',
  });
}

export function useSelectedListId() {
  return useLocalStorage<number | null>({ key: 'list-id', defaultValue: null });
}

export type ListOptions = {
  sort: 'name' | 'updatedAt';
  order: 'asc' | 'desc';
  groupBy: 'none' | 'category';
};

export function useListOptions() {
  return useLocalStorage<ListOptions>({
    key: 'list-options',
    defaultValue: { sort: 'name', order: 'asc', groupBy: 'none' },
  });
}
