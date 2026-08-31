import { createOverlay } from '@/shared/lib/overlay';

export type FeedbackTab = 'feedback' | 'error';

export const { Provider: FeedbackProvider, useOverlay: useFeedback } =
  createOverlay<FeedbackTab>('Feedback');
