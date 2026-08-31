import type { ListsDtoOutputItem } from '@/shared/api/generated/models';
import { createOverlay } from '@/shared/lib/overlay';

export const { Provider: ListFormProvider, useOverlay: useListForm } =
  createOverlay<ListsDtoOutputItem>('ListForm');
