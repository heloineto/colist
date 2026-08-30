import { createContext, use, useState, type ReactNode } from 'react';
import type { ListsDtoOutputItem } from '@/shared/api/generated/models';

type ListFormState = { opened: boolean; list: ListsDtoOutputItem | null };
type ListFormApi = ListFormState & { open: (list?: ListsDtoOutputItem) => void; close: () => void };

const ListFormContext = createContext<ListFormApi | null>(null);

export function ListFormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ListFormState>({ opened: false, list: null });
  const api: ListFormApi = {
    ...state,
    open: (list) => setState({ opened: true, list: list ?? null }),
    close: () => setState((previous) => ({ ...previous, opened: false })),
  };
  return <ListFormContext value={api}>{children}</ListFormContext>;
}

export function useListForm() {
  const context = use(ListFormContext);
  if (!context) throw new Error('useListForm outside ListFormProvider');
  return context;
}
