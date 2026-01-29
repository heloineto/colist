import { type Tables } from '../supabase/database-types';
import { type ProfileBase } from './profiles';
import { PROFILES_COLUMNS_BASE } from './profiles';

export type FeedbackBase = Tables<'feedbacks'>;
export type Feedback = FeedbackBase & {
  profile: ProfileBase | null;
};

export const FEEDBACKS_TABLE = 'feedbacks';
export const FEEDBACKS_COLUMNS_BASE = `
  id,
  created,
  message,
  files,
  rating,
  profileId
`;
export const FEEDBACKS_COLUMNS = `
  ${FEEDBACKS_COLUMNS_BASE},
  profile:profiles ( ${PROFILES_COLUMNS_BASE} )
` as const;
