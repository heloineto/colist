import { Affix, CloseButton, Modal, Paper, Transition } from '@mantine/core';
import { useTranslation } from '@information-systems/translations';
import { NpsRating } from './components/nps-rating';

interface Props {
  opened: boolean;
  onClose: () => void;
  mode?: 'affix' | 'modal';
}

export function NpsForm({ opened, onClose, mode = 'affix' }: Props) {
  const { t } = useTranslation();

  const content = (
    <>
      <CloseButton className="!absolute right-2 top-2" onClick={onClose} />
      <div className="flex flex-col items-center justify-center p-md">
        <div className="text-xl font-bold text-bright">
          {t({
            pt: 'Sua experiência conosco',
            en: 'Your experience with us',
            es: 'Tu experiencia con nosotros',
          })}
        </div>
        <div className="text-dimmed">
          {t({
            pt: 'O quão provável é que você nos recomende a um amigo ou colega?',
            en: 'How likely are you to recommend us to a friend or colleague?',
            es: '¿Qué tan probable es que nos recomiendes a un amigo o colega?',
          })}
        </div>
        <NpsRating />
      </div>
    </>
  );

  if (mode === 'modal') {
    return (
      <Modal opened={opened} onClose={onClose} withCloseButton>
        {content}
      </Modal>
    );
  }

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="slide-up" mounted={opened}>
        {(style) => <Paper style={style}>{content}</Paper>}
      </Transition>
    </Affix>
  );
}
