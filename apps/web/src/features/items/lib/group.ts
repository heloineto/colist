import type { CategoriesDtoOutputItem, ItemsDtoOutputItem } from '@/shared/api/generated/models';

export type ItemGroup = { id: number | null; name: string | null; items: ItemsDtoOutputItem[] };

/** Buckets items by category, sorted by category name (locale-aware); uncategorized last. */
export function groupByCategory(items: ItemsDtoOutputItem[], categories: CategoriesDtoOutputItem[], locale: string): ItemGroup[] {
  const byId = new Map(categories.map((category) => [category.id, category.name]));
  const buckets = new Map<number | null, ItemsDtoOutputItem[]>();
  for (const item of items) {
    const key = item.categoryId !== null && byId.has(item.categoryId) ? item.categoryId : null;
    buckets.set(key, [...(buckets.get(key) ?? []), item]);
  }
  const groups = [...buckets].map(([id, bucket]) => ({ id, name: id === null ? null : (byId.get(id) ?? null), items: bucket }));
  return groups.sort((left, right) => {
    if (left.id === null) return 1;
    if (right.id === null) return -1;
    return (left.name ?? '').localeCompare(right.name ?? '', locale);
  });
}

export function splitChecked(items: ItemsDtoOutputItem[]) {
  return {
    unchecked: items.filter((item) => !item.checked),
    checked: items.filter((item) => item.checked),
  };
}

export function itemHeight(item: Pick<ItemsDtoOutputItem, 'details'>) {
  return item.details ? 68 : 48;
}
