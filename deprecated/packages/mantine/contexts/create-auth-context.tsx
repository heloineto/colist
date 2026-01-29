import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { type UseQuerySingleReturn } from '@supabase-cache-helpers/postgrest-react-query';

export function useUserQuery(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const userResponse = await supabase.auth.getUser();

      if (userResponse.error) throw userResponse.error;

      const { user } = userResponse.data;
      return user;
    },
  });
}

export function useSessionQuery(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const sessionResponse = await supabase.auth.getSession();

      if (sessionResponse.error) throw sessionResponse.error;

      const { session } = sessionResponse.data;
      return session;
    },
  });
}

export interface AuthContextType<TProfile> {
  userQuery: UseQueryResult<User>;
  sessionQuery: UseQueryResult<Session | null>;
  profileQuery: UseQuerySingleReturn<TProfile>;
}

export function createAuthContext<TProfile>() {
  const AuthContext = createContext<AuthContextType<TProfile> | null>(null);

  function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
      throw new Error('useAuth must be used within a AuthProvider');
    }

    return context;
  }

  function AuthProvider({
    children,
    ...value
  }: { children: ReactNode } & AuthContextType<TProfile>) {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }

  return { AuthContext, useAuth, AuthProvider };
}
