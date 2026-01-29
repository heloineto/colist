import { supabase } from './create-browser-client';

export function getProfilePicture(
  params:
    | {
        id: string;
        picture: string | null | undefined;
      }
    | null
    | undefined
) {
  if (!params) return null;

  return params.picture
    ? supabase.storage
        .from('profiles')
        .getPublicUrl(`${params.id}/${params.picture}`).data.publicUrl
    : null;
}
