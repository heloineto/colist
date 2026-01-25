import type { Disclosure } from '@information-systems/mantine';
import { useEffect, useState } from 'react';
import { AmountModal } from '../../../amount-modal';
import { useItemsContext } from '../../utils/items-context';
import type { Item } from '@/utils/queries/items';

interface Props {
  item: Item | null;
  disclosure: Disclosure;
}

export function ItemAmountModal({ item, disclosure }: Props) {
  const { updateMutation } = useItemsContext();
  const [amount, setAmount] = useState<number | string>(item?.amount ?? 1);
  useEffect(() => setAmount(item?.amount ?? 1), [item]);

  return (
    <AmountModal
      opened={disclosure.opened}
      onClose={() => {
        updateMutation.mutate({
          id: item?.id,
          amount: Number(amount),
        });
        disclosure.close();
      }}
      value={amount}
      onChange={setAmount}
    />
  );
}
