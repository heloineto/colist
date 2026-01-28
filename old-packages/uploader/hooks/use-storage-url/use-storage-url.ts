import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { TransformOptions } from '@supabase/storage-js';
import { type SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_EXPIRES_IN = 60 * 60 * 8;

export type UseStorageUrlParams = Omit<
  UseQueryOptions<{ signed: boolean; url: string }>,
  'queryKey' | 'queryFn'
> & {
  client: SupabaseClient;
  bucket: string;
  path: string | null | undefined;
  options?: { download?: string | boolean; transform?: TransformOptions };
  signed?: boolean;
  expiresIn?: number;
};

export function useStorageUrl({
  client,
  signed = false,
  bucket,
  expiresIn = DEFAULT_EXPIRES_IN,
  path,
  options,
  enabled,
  ...rest
}: UseStorageUrlParams) {
  return useQuery({
    queryKey: ['storage-url', signed, bucket, path, expiresIn, options],
    staleTime: signed ? expiresIn * 1000 : undefined,
    queryFn: async () => {
      if (!signed) {
        const { data } = client.storage
          .from(bucket)
          .getPublicUrl(path as string, options);

        return {
          signed: false,
          url: data.publicUrl,
        };
      }

      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(path as string, expiresIn, options);

      if (error) {
        throw error;
      }

      return {
        signed: true,
        url: data.signedUrl,
      };
    },
    enabled: Boolean(path) && (enabled === undefined || enabled),
    ...rest,
  });
}
