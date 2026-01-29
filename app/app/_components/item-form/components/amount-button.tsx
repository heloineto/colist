import { useDisclosure } from '@/deprecated/packages/mantine';
import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Tooltip } from '@mantine/core';
import {
  Hash,
  NumberCircleOne,
  NumberCircleTwo,
  NumberCircleThree,
  NumberCircleFour,
  NumberCircleFive,
  NumberCircleSix,
  NumberCircleSeven,
  NumberCircleEight,
  NumberCircleNine,
} from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import { AmountModal as OriginalAmountModal } from '@/app/app/_components/amount-modal';

const AmountModal = withController(OriginalAmountModal);

const numberToCircleIcon = {
  1: NumberCircleOne,
  2: NumberCircleTwo,
  3: NumberCircleThree,
  4: NumberCircleFour,
  5: NumberCircleFive,
  6: NumberCircleSix,
  7: NumberCircleSeven,
  8: NumberCircleEight,
  9: NumberCircleNine,
};

export function AmountButton() {
  const { t } = useTranslation();
  const disclosure = useDisclosure();
  const itemForm = useItemForm();

  const amount = useWatch({
    control: itemForm.control,
    name: 'amount',
  });

  const Icon =
    amount in numberToCircleIcon
      ? numberToCircleIcon[amount as keyof typeof numberToCircleIcon]
      : Hash;

  return (
    <>
      <Tooltip label={t({ pt: 'Quantidade', en: 'Quantity', es: 'Cantidad' })}>
        <ActionIcon
          variant="subtle"
          size="lg"
          color="gray"
          onClick={disclosure.open}
        >
          <Icon size="1.25rem" />
        </ActionIcon>
      </Tooltip>
      <AmountModal
        opened={disclosure.opened}
        onClose={disclosure.close}
        name="amount"
        control={itemForm.control}
      />
    </>
  );
}
