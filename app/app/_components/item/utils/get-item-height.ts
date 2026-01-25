import type { Item } from '@/utils/queries/items';

export function getItemHeight(item: Item) {
  if (item.details) {
    return 68;
  }
  return 48;
}
