import type { ItemsDtoOutputItem } from '@/shared/api/generated/models';
import { createOverlay } from '@/shared/lib/overlay';

export const { Provider: ItemFormProvider, useOverlay: useItemForm } =
  createOverlay<ItemsDtoOutputItem>('ItemForm', { keyboard: true });
