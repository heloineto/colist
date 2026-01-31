import { useDisclosure } from '@/deprecated/packages/mantine';
import { useState } from 'react';
import type { Item } from '@/deprecated/utils/queries/items';

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
