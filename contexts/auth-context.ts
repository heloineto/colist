'use client';

import { createAuthContext } from '@/deprecated/packages/mantine';
import type { Profile } from '@/deprecated/utils/queries/profiles';

export const { useAuth, AuthProvider } = createAuthContext<Profile>();
