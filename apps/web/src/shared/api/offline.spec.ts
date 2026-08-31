import { MutationObserver, QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
  getItemsCreateMutationKey,
  getItemsDeleteMutationKey,
  getItemsQueryKey,
  getItemsUpdateMutationKey,
} from '@/shared/api/generated/items/items';
import type { ItemsDtoOutput } from '@/shared/api/generated/models';
import { registerOfflineMutations } from '@/shared/api/offline';

vi.mock('@/shared/api/fetcher', () => ({
  fetcher: vi.fn(() => Promise.resolve()),
}));

const LIST_ID = 7;
const queryKey = getItemsQueryKey(LIST_ID, { sort: 'name' });
const base: ItemsDtoOutput = [
  {
    id: 1,
    listId: LIST_ID,
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

function setup() {
  const queryClient = new QueryClient();
  registerOfflineMutations(queryClient);
  queryClient.setQueryData(queryKey, base);
  const items = () => queryClient.getQueryData<ItemsDtoOutput>(queryKey) ?? [];
  const mutate = (mutationKey: readonly unknown[], variables: unknown) =>
    new MutationObserver<unknown, Error, unknown>(queryClient, {
      mutationKey: [...mutationKey],
    }).mutate(variables);
  return { queryClient, items, mutate };
}

describe('offline mutations', () => {
  it('patches every items query of the list optimistically', async () => {
    const { items, mutate } = setup();

    await mutate(getItemsUpdateMutationKey(), {
      listId: LIST_ID,
      itemId: 1,
      data: { checked: true },
    });

    expect(items()[0]?.checked).toBe(true);
  });

  it('appends a created item and drops a deleted one', async () => {
    const { items, mutate } = setup();

    await mutate(getItemsCreateMutationKey(), {
      listId: LIST_ID,
      data: { name: 'Leite' },
    });
    expect(items().map((item) => item.name)).toEqual(['Pão', 'Leite']);

    await mutate(getItemsDeleteMutationKey(), { listId: LIST_ID, itemId: 1 });
    expect(items().map((item) => item.name)).toEqual(['Leite']);
  });

  it('replays content ops in one serial scope', () => {
    const { queryClient } = setup();

    expect(
      queryClient.getMutationDefaults(getItemsCreateMutationKey()).scope?.id
    ).toBe('offline-content');
  });
});
