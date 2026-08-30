import { useDisclosure } from '@mantine/hooks';
import { type ReactNode, createContext, use } from 'react';

type HistoryApi = { opened: boolean; open: () => void; close: () => void };
const HistoryContext = createContext<HistoryApi | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <HistoryContext value={{ opened, open, close }}>{children}</HistoryContext>
  );
}

export function useHistory() {
  const context = use(HistoryContext);
  if (!context) throw new Error('useHistory outside HistoryProvider');
  return context;
}
