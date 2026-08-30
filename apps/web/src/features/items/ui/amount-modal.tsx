import { ActionIcon, Divider, Modal, NumberInput, type NumberInputHandlers } from '@mantine/core';
import { HashIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalHeader } from '@/shared/ui/modal-header';

type Props = { opened: boolean; value: number; onChange: (value: number) => void; onClose: () => void };

export function AmountModal({ opened, value, onChange, onClose }: Props) {
  const { t } = useTranslation();
  const handlers = useRef<NumberInputHandlers>(null);

  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} classNames={{ body: 'p-0!' }} size="xs">
      <ModalHeader icon={<HashIcon />} title={t('items.amount.title')} description={t('items.amount.description')} />
      <div className="flex justify-center p-4">
        <ActionIcon size={50} variant="default" className="rounded-r-none!" onClick={() => handlers.current?.decrement()} aria-label="-">
          <MinusIcon size="1.25rem" weight="bold" />
        </ActionIcon>
        <NumberInput
          size="lg"
          hideControls
          handlersRef={handlers}
          min={1}
          step={1}
          allowDecimal={false}
          w={100}
          value={value}
          onChange={(next) => onChange(Math.max(1, Number(next) || 1))}
          classNames={{ input: 'text-center! rounded-none!' }}
        />
        <ActionIcon size={50} variant="default" className="rounded-l-none!" onClick={() => handlers.current?.increment()} aria-label="+">
          <PlusIcon size="1.25rem" weight="bold" />
        </ActionIcon>
      </div>
      <Divider />
    </Modal>
  );
}
