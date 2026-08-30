import { createContext, use, useState, type ReactNode } from 'react';
import type { ItemsDtoOutputItem } from '@/shared/api/generated/models';

type ItemFormState = { opened: boolean; item: ItemsDtoOutputItem | null };
type ItemFormApi = ItemFormState & { open: (item?: ItemsDtoOutputItem) => void; close: () => void };

const ItemFormContext = createContext<ItemFormApi | null>(null);

export function ItemFormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ItemFormState>({ opened: false, item: null });
  const api: ItemFormApi = {
    ...state,
    open: (item) => setState({ opened: true, item: item ?? null }),
    close: () => setState((previous) => ({ ...previous, opened: false })),
  };
  return <ItemFormContext value={api}>{children}</ItemFormContext>;
}

export function useItemForm() {
  const context = use(ItemFormContext);
  if (!context) throw new Error('useItemForm outside ItemFormProvider');
  return context;
}
