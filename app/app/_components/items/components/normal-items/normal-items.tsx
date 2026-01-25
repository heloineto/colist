import { motion, AnimatePresence } from 'framer-motion';
import { getItemHeight } from '../../../item/utils/get-item-height';
import { Item } from '../../../item/item';
import type { Item as ItemType } from '@/utils/queries/items';

interface Props {
  items: ItemType[];
}

export function NormalItems({ items }: Props) {
  return (
    <AnimatePresence initial={false}>
      {items.map((item) => (
        <motion.div
          className="relative shrink-0"
          key={item.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: getItemHeight(item), opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="absolute top-0 left-0 size-full">
            <Item item={item} />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
