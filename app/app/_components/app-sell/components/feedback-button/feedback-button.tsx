import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Tooltip, NavLink } from '@mantine/core';
import { ChatCircle } from '@phosphor-icons/react/dist/ssr';
import { openFeedbackModal } from '@/components/feedback-modal/components/feedback-context-modal';

interface Props {
  mode?: 'nav' | 'footer';
}

export function FeedbackButton({ mode }: Props) {
  const { t } = useTranslation();

  const label = t({
    pt: 'Deixar feedback',
    en: 'Leave feedback',
    es: 'Dejar feedback',
  });

  if (mode === 'nav') {
    return (
      <NavLink
        label={label}
        component="button"
        leftSection={<ChatCircle size="1.25rem" />}
        onClick={() => openFeedbackModal({ initialTab: 'feedback' })}
      />
    );
  }

  return (
    <Tooltip label={label} openDelay={0}>
      <ActionIcon
        variant="subtle"
        size="2.25rem"
        color="gray"
        radius="md"
        onClick={() => openFeedbackModal({ initialTab: 'feedback' })}
      >
        <ChatCircle size="1.375rem" />
      </ActionIcon>
    </Tooltip>
  );
}
