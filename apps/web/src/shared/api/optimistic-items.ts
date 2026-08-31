import type {
  CreateItemDto,
  ItemsDtoOutput,
  UpdateItemDto,
} from '@/shared/api/generated/models';

/** Optimistic patches for the offline item queue; server refetch reconciles. */

export function appendItem(
  items: ItemsDtoOutput,
  listId: number,
  data: CreateItemDto
): ItemsDtoOutput {
  const now = new Date().toISOString();
  return [
    ...items,
    {
      id: -Math.floor(Math.random() * 2 ** 31) - 1,
      listId,
      categoryId: data.categoryId ?? null,
      clientId: data.clientId ?? null,
      name: data.name,
      amount: data.amount ?? 1,
      checked: false,
      details: data.details ?? null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function patchItem(
  items: ItemsDtoOutput,
  itemId: number,
  data: UpdateItemDto
): ItemsDtoOutput {
  return items.map((item) =>
    item.id === itemId
      ? { ...item, ...data, updatedAt: new Date().toISOString() }
      : item
  );
}

export function removeItem(
  items: ItemsDtoOutput,
  itemId: number
): ItemsDtoOutput {
  return items.filter((item) => item.id !== itemId);
}
