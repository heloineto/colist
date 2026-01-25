import { Button } from '@mantine/core';
import { useTranslation } from '@information-systems/translations';
import { AvatarLoading } from '@information-systems/uploader';
import { useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import type { AvatarInputProps } from '@information-systems/uploader';
import { getNoName } from '@information-systems/states';
import { TextInput, withController } from 'mantine-hook-form';
import { supabase } from '@/utils/supabase/create-browser-client';
import type { Profile } from '@/utils/queries/profiles';
import { PROFILES_COLUMNS, PROFILES_TABLE } from '@/utils/queries/profiles';
import { MEMBERS_TABLE } from '@/utils/queries/members';

const OriginalAvatarInput = lazy(() =>
  import('@information-systems/uploader').then((mod) => ({
    default: mod.AvatarInput,
  }))
) as unknown as (props: AvatarInputProps) => ReactNode;

const AvatarInput = withController(OriginalAvatarInput);

export interface ProfileFormProps {
  profile: Profile;
  onClose: () => void;
}

export function ProfileForm({ profile, onClose }: ProfileFormProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateMutation(
    supabase.from(PROFILES_TABLE),
    ['id'],
    PROFILES_COLUMNS,
    { revalidateTables: [{ table: MEMBERS_TABLE }] }
  );
  const form = useForm({
    defaultValues: {
      name: profile.name ?? '',
      picture: profile.picture,
    },
  });

  return (
    <form
      className="flex flex-col"
      onSubmit={form.handleSubmit((values) => {
        updateMutation.mutate({
          id: profile.id,
          name: values.name || null,
          picture: values.picture,
        });
        onClose();
      })}
    >
      <Suspense fallback={<AvatarLoading size={128} radius="md" />}>
        <AvatarInput
          name="picture"
          color="initials"
          control={form.control}
          bucket="profiles"
          client={supabase}
          mode="inline"
          path={profile.id}
          size={128}
          radius="md"
          avatarProps={{ name: profile.name || undefined }}
          uploaderProps={{
            title: t({
              pt: 'Foto de perfil',
              en: 'Profile picture',
              es: 'Foto de perfil',
            }),
          }}
        />
      </Suspense>
      <TextInput
        className="mt-xs"
        label={t({ pt: 'Nome', en: 'Name', es: 'Nombre' })}
        name="name"
        control={form.control}
        placeholder={getNoName(t)}
      />
      <div className="mt-lg flex flex-col-reverse gap-xs xs:flex-row xs:justify-end">
        <Button className="min-w-32" variant="default" onClick={onClose}>
          {t({ pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' })}
        </Button>
        <Button className="min-w-32" type="submit">
          {t({ pt: 'Salvar', en: 'Save', es: 'Guardar' })}
        </Button>
      </div>
    </form>
  );
}
