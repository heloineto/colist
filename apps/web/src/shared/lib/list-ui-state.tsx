import { useDebouncedValue } from '@mantine/hooks';
import { createContext, use, useState, type ReactNode } from 'react';

export type ListUiState = {
  search: string;
  debouncedSearch: string;
  searchOpened: boolean;
  setSearch: (value: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
};

const ListUiContext = createContext<ListUiState | null>(null);

export function ListUiProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  const [searchOpened, setSearchOpened] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const value: ListUiState = {
    search,
    debouncedSearch,
    searchOpened,
    setSearch,
    openSearch: () => setSearchOpened(true),
    closeSearch: () => {
      setSearchOpened(false);
      setSearch('');
    },
  };

  return <ListUiContext value={value}>{children}</ListUiContext>;
}

export function useListUi() {
  const context = use(ListUiContext);
  if (!context) throw new Error('useListUi outside ListUiProvider');
  return context;
}
