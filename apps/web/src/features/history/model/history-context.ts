import { createOverlay } from '@/shared/lib/overlay';

export const { Provider: HistoryProvider, useOverlay: useHistory } =
  createOverlay('History');
