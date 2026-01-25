import { useDisclosure } from '@information-systems/mantine';
import { useState } from 'react';
import type { Item } from '@/utils/queries/items';

export function useItemAmountModal() {
  const [item, setItem] = useState<Item | null>(null);
  const disclosure = useDisclosure();

  function openAmountModal(i: Item) {
    setItem(i);
    disclosure.open();
  }

  return {
    openAmountModal,
    amountModalProps: { disclosure, item },
  };
}
