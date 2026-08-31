import { describe, expect, it } from 'vitest';
import type { ItemsDtoOutput } from '@/shared/api/generated/models';
import {
  appendItem,
  patchItem,
  removeItem,
} from '@/shared/api/optimistic-items';

const base: ItemsDtoOutput = [
  {
    id: 1,
    listId: 7,
    categoryId: null,
    clientId: null,
    name: 'Pão',
    amount: 1,
    checked: false,
    details: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('optimistic items', () => {
  it('appends a temp item with a negative id', () => {
    const next = appendItem(base, 7, { name: 'Leite' });
    expect(next).toHaveLength(2);
    const added = next[1];
    expect(added?.id).toBeLessThan(0);
    expect(added?.name).toBe('Leite');
    expect(added?.checked).toBe(false);
    expect(added?.amount).toBe(1);
    expect(base).toHaveLength(1);
  });

  it('patches only the targeted item', () => {
    const next = patchItem(base, 1, { checked: true });
    expect(next[0]?.checked).toBe(true);
    expect(next[0]?.name).toBe('Pão');
    expect(patchItem(base, 99, { checked: true })).toEqual(base);
  });

  it('removes by id', () => {
    expect(removeItem(base, 1)).toEqual([]);
    expect(removeItem(base, 99)).toEqual(base);
  });
});
