import { Badge, Checkbox, Highlight } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { invalidateList } from '@/entities/list';
import { itemHeight } from '@/features/items/lib/group';
import { useItemForm } from '@/features/items/model/item-form-context';
import { AmountModal } from '@/features/items/ui/amount-modal';
import { useItemsUpdate } from '@/shared/api/generated/items/items';
import type { ItemsDtoOutputItem } from '@/shared/api/generated/models';

export function ItemRow({
  item,
  search,
}: {
  item: ItemsDtoOutputItem;
  search: string;
}) {
  const itemForm = useItemForm();
  const [amountOpened, amountModal] = useDisclosure(false);
  const [amount, setAmount] = useState(item.amount);
  const update = useItemsUpdate({
    mutation: {
      meta: { silent: true },
      onSettled: () => invalidateList(item.listId),
    },
  });
  const patch = (
    data: Partial<Pick<ItemsDtoOutputItem, 'checked' | 'amount'>>
  ) => update.mutate({ listId: item.listId, itemId: item.id, data });

  return (
    <div
      className="flex items-center gap-4 px-3"
      style={{ height: itemHeight(item) }}
    >
      <Checkbox
        className="shrink-0"
        radius="xl"
        size="1.75rem"
        checked={item.checked}
        onChange={(event) => patch({ checked: event.currentTarget.checked })}
        aria-label={item.name}
      />
      <button
        type="button"
        className="flex min-w-0 grow cursor-pointer flex-col justify-center border-none bg-transparent p-0 text-left"
        onClick={() => itemForm.open(item)}
      >
        <Highlight
          highlight={search}
          className={`h-6 truncate ${item.checked ? 'text-dimmed line-through' : ''}`}
        >
          {item.name}
        </Highlight>
        {item.details && (
          <Highlight
            highlight={search}
            className="text-dimmed h-5 truncate text-sm"
          >
            {item.details}
          </Highlight>
        )}
      </button>
      <Badge
        component="button"
        className="h-6! shrink-0 cursor-pointer"
        variant="light"
        size="xl"
        onClick={() => {
          setAmount(item.amount);
          amountModal.open();
        }}
      >
        {item.amount}
      </Badge>
      <AmountModal
        opened={amountOpened}
        value={amount}
        onChange={setAmount}
        onClose={() => {
          amountModal.close();
          if (amount !== item.amount) patch({ amount });
        }}
      />
    </div>
  );
}
