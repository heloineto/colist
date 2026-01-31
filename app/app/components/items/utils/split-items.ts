import type { Item } from '@/deprecated/utils/queries/items';

export function splitItems(items: Item[]) {
  const checkedItems = [];
  const uncheckedItems = [];

  for (const item of items) {
    if (item.checked) {
      checkedItems.push(item);
    } else {
      uncheckedItems.push(item);
    }
  }

  return {
    checkedItems,
    uncheckedItems,
  };
}
