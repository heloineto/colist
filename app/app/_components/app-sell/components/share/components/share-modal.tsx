import { useTranslation } from '@information-systems/translations';
import type { ModalProps } from '@mantine/core';
import { Divider, Modal, ScrollAreaAutosize } from '@mantine/core';
import { UsersThree } from '@phosphor-icons/react/dist/ssr';
import { useMemberForm } from '../contexts/member-form-context';
import { Member } from './member';
import { ShareForm } from './share-form';
import type { List } from '@/utils/queries/lists';
import { ModalHeader } from '@/components/modal-header';
import type { Member as MemberType } from '@/utils/queries/members';
import { useAuth } from '@/contexts/auth-context';

interface Props extends ModalProps {
  list: List;
  members: MemberType[];
}

export function ShareModal({ list, members, ...rest }: Props) {
  const { t } = useTranslation();
  const form = useMemberForm();

  const { profileQuery } = useAuth();
  const currentMember = members.find(
    (member) => member.profileId === profileQuery.data?.id
  );
  const showForm = currentMember && ['owner'].includes(currentMember.role);
  const showOptions = showForm;

  return (
    <Modal
      withCloseButton={false}
      classNames={{ body: '!p-0' }}
      centered={false}
      transitionProps={{
        onExited: () => form.reset(form.initialValues),
      }}
      {...rest}
    >
      <div className="flex flex-col">
        <ModalHeader
          className="p-md"
          title={t({ pt: 'Membros', en: 'Members', es: 'Miembros' })}
          description={t({
            pt: `Membros da lista "${list.name}"`,
            en: `Members of the list "${list.name}"`,
            es: `Miembros de la lista "${list.name}"`,
          })}
          icon={<UsersThree />}
        />
        <Divider />
        <ScrollAreaAutosize mah="calc(100dvh - var(--modal-y-offset) * 2 - 75px)">
          <div className="flex w-[var(--modal-size)] max-w-[calc(100vw-var(--modal-x-offset)*2)] flex-col gap-xs p-md">
            {showForm ? <ShareForm members={members} /> : null}
            <div className="flex flex-col gap-xs">
              {members.map((member) => (
                <Member
                  key={`${member.listId}-${member.profileId}`}
                  member={member}
                  list={list}
                  showOptions={showOptions}
                />
              ))}
            </div>
          </div>
        </ScrollAreaAutosize>
      </div>
    </Modal>
  );
}
