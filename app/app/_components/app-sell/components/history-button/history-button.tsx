import { useDisclosure } from '@/deprecated/packages/mantine';
import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Drawer, Modal, Tooltip, NavLink } from '@mantine/core';
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr';
import { EmptyState } from '@/deprecated/packages/states';

interface Props {
  mode?: 'nav' | 'footer';
}

export function HistoryButton({ mode }: Props) {
  const { t } = useTranslation();
  const disclosure = useDisclosure();

  const label = t({ pt: 'Histórico', en: 'History', es: 'Histórico' });

  const content = (
    <EmptyState
      icon={<ClockCounterClockwise />}
      title={t({
        pt: 'Histórico vazio',
        en: 'Empty history',
        es: 'Histórico vacío',
      })}
      description={t({
        pt: 'As operações realizadas na lista serão exibidas aqui.',
        en: 'Operations performed on the list will be displayed here.',
        es: 'Las operaciones realizadas en la lista se mostrarán aquí.',
      })}
    />
  );

  if (mode === 'nav') {
    return (
      <>
        <NavLink
          label={label}
          component="button"
          leftSection={<ClockCounterClockwise size="1.25rem" />}
          onClick={disclosure.toggle}
        />
        <Drawer
          opened={disclosure.opened}
          onClose={disclosure.close}
          position="right"
          classNames={{ content: '!flex flex-col', body: 'flex grow' }}
        >
          {content}
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Tooltip label={label} openDelay={0}>
        <ActionIcon
          variant="subtle"
          size="2.25rem"
          color="gray"
          radius="md"
          onClick={disclosure.toggle}
        >
          <ClockCounterClockwise size="1.375rem" />
        </ActionIcon>
      </Tooltip>
      <Modal
        title={t({ pt: 'Histórico', en: 'History', es: 'Histórico' })}
        opened={disclosure.opened}
        onClose={disclosure.close}
        size="xl"
        fullScreen
        classNames={{ content: '!flex flex-col', body: 'flex grow' }}
      >
        {content}
      </Modal>
    </>
  );
}
