import { useDisclosure } from '@/deprecated/packages/mantine';
import { useTranslation } from '@/deprecated/packages/translations';
import { ActionIcon, Tooltip } from '@mantine/core';
import {
  HashIcon,
  NumberCircleOneIcon,
  NumberCircleTwoIcon,
  NumberCircleThreeIcon,
  NumberCircleFourIcon,
  NumberCircleFiveIcon,
  NumberCircleSixIcon,
  NumberCircleSevenIcon,
  NumberCircleEightIcon,
  NumberCircleNineIcon,
} from '@phosphor-icons/react/dist/ssr';
import { useWatch } from 'react-hook-form';
import { withController } from '@/deprecated/packages/mantine-hook-form';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import { AmountModal as OriginalAmountModal } from '@/app/app/_components/amount-modal';

const AmountModal = withController(OriginalAmountModal);

const numberToCircleIcon = {
  1: NumberCircleOneIcon,
  2: NumberCircleTwoIcon,
  3: NumberCircleThreeIcon,
  4: NumberCircleFourIcon,
  5: NumberCircleFiveIcon,
  6: NumberCircleSixIcon,
  7: NumberCircleSevenIcon,
  8: NumberCircleEightIcon,
  9: NumberCircleNineIcon,
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
      : HashIcon;

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
