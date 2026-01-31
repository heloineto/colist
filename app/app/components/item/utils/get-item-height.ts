import type { Item } from '@/deprecated/utils/queries/items';

export function getItemHeight(item: Item) {
  if (item.details) {
    return 68;
  }
  return 48;
}
