import { createContext, use, useState, type ReactNode } from 'react';

export type FeedbackTab = 'feedback' | 'error';
type FeedbackApi = { opened: boolean; tab: FeedbackTab; setTab: (tab: FeedbackTab) => void; open: (tab?: FeedbackTab) => void; close: () => void };

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<FeedbackTab>('feedback');
  const api: FeedbackApi = {
    opened,
    tab,
    setTab,
    open: (next = 'feedback') => {
      setTab(next);
      setOpened(true);
    },
    close: () => setOpened(false),
  };
  return <FeedbackContext value={api}>{children}</FeedbackContext>;
}

export function useFeedback() {
  const context = use(FeedbackContext);
  if (!context) throw new Error('useFeedback outside FeedbackProvider');
  return context;
}
