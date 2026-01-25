'use client';

import { createAuthContext } from '@information-systems/mantine';
import type { Profile } from '@/utils/queries/profiles';

export const { useAuth, AuthProvider } = createAuthContext<Profile>();
