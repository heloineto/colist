import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon } from '@mantine/core';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { useMutation } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { TextInput } from '@/deprecated/packages/mantine-hook-form';
import { useMemberForm } from '../contexts/member-form-context';
import { ProfileModalContent } from './profile-modal-content';
import type { Member as MemberType } from '@/deprecated/utils/queries/members';
import { supabase } from '@/deprecated/utils/supabase/create-browser-client';
import { useListContext } from '@/app/app/_utils/list-context';

interface Props {
  members: MemberType[];
}

export function ShareForm({ members }: Props) {
  const { t } = useTranslation();
  const form = useMemberForm();
  const { listId } = useListContext();

  const mutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data } = await supabase
        .rpc('getProfile', { email })
        .throwOnError();
      return data;
    },
    onSuccess: (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --- data might be null
      if (!data || !listId) {
        showNotification({
          message: t({
            pt: 'Erro inesperado ao buscar perfil',
            en: 'Unexpected error while fetching profile',
            es: 'Error inesperado al buscar perfil',
          }),
          color: 'red',
        });
        return;
      }

      if (data.length === 0) {
        showNotification({
          message: t({
            pt: 'Usuário com este e-mail não encontrado',
            en: 'User with this email not found',
            es: 'Usuario con este correo electrónico no encontrado',
          }),
          color: 'red',
        });
        return;
      }

      modals.open({
        withCloseButton: false,
        classNames: { body: '!p-0' },
        children: <ProfileModalContent listId={listId} profile={data[0]} />,
      });
    },
    meta: {
      showSuccessNotification: false,
      showLoadingNotification: false,
    },
  });

  return (
    <form
      className="flex pb-2"
      onSubmit={form.handleSubmit(async (data) => {
        if (!data) {
          throw new Error('No data');
        }

        const exists = members.find(
          (member) => member.profile?.email === data.email
        );

        if (exists) {
          showNotification({
            message: t({
              pt: 'O e-mail já está na lista',
              en: 'The email is already on the list',
              es: 'El correo electrónico ya está en la lista',
            }),
            color: 'red',
          });
          return;
        }

        await mutation.mutateAsync(data);
      })}
    >
      <TextInput
        name="email"
        control={form.control}
        radius="xl"
        className="grow"
        placeholder={t({
          pt: 'Adicionar membro pelo e-mail',
          en: 'Add member by email',
          es: 'Agregar miembro por correo electrónico',
        })}
        rightSection={
          <ActionIcon className="mr-px" radius="xl" type="submit">
            <Plus size="1rem" weight="bold" />
          </ActionIcon>
        }
        type="email"
      />
    </form>
  );
}
