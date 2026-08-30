import { describe, expect, it } from 'vitest';
import { groupByCategory, splitChecked } from '@/features/items/lib/group';
import type {
  CategoriesDtoOutputItem,
  ItemsDtoOutputItem,
} from '@/shared/api/generated/models';

const stamp = {
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
const item = (
  id: number,
  categoryId: number | null,
  checked = false
): ItemsDtoOutputItem => ({
  id,
  listId: 1,
  categoryId,
  clientId: null,
  name: `item ${id}`,
  amount: 1,
  checked,
  details: null,
  ...stamp,
});
const category = (id: number, name: string): CategoriesDtoOutputItem => ({
  id,
  listId: 1,
  name,
  ...stamp,
});

describe('groupByCategory', () => {
  it('sorts groups by name with the uncategorized bucket last and drops empty categories', () => {
    const groups = groupByCategory(
      [item(1, null), item(2, 20), item(3, 10), item(4, 20)],
      [category(10, 'Padaria'), category(20, 'Açougue'), category(30, 'Vazia')],
      'pt-BR'
    );
    expect(groups.map((group) => group.name)).toEqual([
      'Açougue',
      'Padaria',
      null,
    ]);
    expect(groups[0]?.items.map((entry) => entry.id)).toEqual([2, 4]);
  });

  it('treats a dangling categoryId as uncategorized', () => {
    const groups = groupByCategory([item(1, 99)], [], 'en');
    expect(groups).toEqual([{ id: null, name: null, items: [item(1, 99)] }]);
  });
});

describe('splitChecked', () => {
  it('partitions by checked', () => {
    const { checked, unchecked } = splitChecked([
      item(1, null, true),
      item(2, null),
    ]);
    expect(checked.map((entry) => entry.id)).toEqual([1]);
    expect(unchecked.map((entry) => entry.id)).toEqual([2]);
  });
});
