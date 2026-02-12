import { useTranslation } from '@/deprecated/packages/translations';
import type { NumberInputHandlers, NumberInputProps } from '@mantine/core';
import { ActionIcon, Divider, Modal, NumberInput } from '@mantine/core';
import { HashIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr';
import type { ForwardedRef } from 'react';
import { forwardRef, useRef } from 'react';
import { ModalHeader } from '@/components/modal-header';

interface Props extends NumberInputProps {
  opened: boolean;
  onClose: () => void;
}

export const AmountModal = forwardRef(function AmountModal(
  { opened, onClose, ...rest }: Props,
  ref: ForwardedRef<HTMLInputElement>
) {
  const { t } = useTranslation();
  const handlersRef = useRef<NumberInputHandlers>(undefined);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      classNames={{ body: '!p-0' }}
    >
      <ModalHeader
        className="p-md"
        icon={<HashIcon />}
        title={t({ pt: 'Quantidade', en: 'Quantity', es: 'Cantidad' })}
        description={t({
          pt: 'Selecione a quantidade desejada',
          en: 'Select the desired quantity',
          es: 'Seleccione la cantidad deseada',
        })}
      />
      <Divider mb="md" />
      <div className="px-md pb-md flex justify-center">
        <ActionIcon
          className="!rounded-r-none !border-r-50"
          size={50}
          variant="default"
          onClick={() => handlersRef.current?.decrement()}
        >
          <MinusIcon size="1.25rem" />
        </ActionIcon>
        <NumberInput
          ref={ref}
          size="lg"
          hideControls
          handlersRef={handlersRef}
          min={1}
          step={1}
          classNames={{ input: '!text-center !rounded-none' }}
          allowDecimal={false}
          {...rest}
        />
        <ActionIcon
          className="!rounded-l-none !border-l-50"
          size={50}
          variant="default"
          onClick={() => handlersRef.current?.increment()}
        >
          <PlusIcon size="1.25rem" />
        </ActionIcon>
      </div>
    </Modal>
  );
});
