import { Badge, Checkbox, Highlight } from '@mantine/core';
import clsx from 'clsx';
import { useItemForm } from '../../_utils/item-form-context';
import { useItemsContext } from '../items/utils/items-context';
import { getItemHeight } from './utils/get-item-height';
import type { Item as ItemType } from '@/utils/queries/items';

interface Props {
  item: ItemType;
}

export function Item({ item }: Props) {
  const itemForm = useItemForm();
  const { updateMutation, search, openAmountModal } = useItemsContext();

  return (
    <div className="gap-md px-sm flex items-center">
      <Checkbox
        className="my-2.5 shrink-0"
        radius="xl"
        size="1.75rem"
        checked={item.checked}
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          updateMutation.mutate({ id: item.id, checked });
        }}
      />
      <button
        className="mantine-focus-auto py-sm flex grow cursor-pointer border-none bg-transparent px-0 [--webkit-tap-highlight-color:transparent]"
        type="button"
        style={{ height: getItemHeight(item) }}
        onClick={() => {
          itemForm.reset(itemForm.fromDatabase(item));
          itemForm.disclosure.open();
        }}
      >
        <div className="relative grow">
          <div className="absolute top-0 left-0 w-full">
            <Highlight
              c="gray"
              className={clsx(
                '!text-md h-6 truncate text-left',
                item.checked ? 'line-through' : ''
              )}
              highlight={search}
            >
              {item.name}
            </Highlight>
            {item.details ? (
              <Highlight
                className="!text-dimmed h-5 truncate text-left !text-sm"
                highlight={search}
              >
                {item.details}
              </Highlight>
            ) : null}
          </div>
        </div>
      </button>
      <Badge
        className="my-3 !h-6"
        variant="light"
        size="xl"
        component="button"
        type="button"
        onClick={() => openAmountModal(item)}
      >
        {item.amount}
      </Badge>
    </div>
  );
}
