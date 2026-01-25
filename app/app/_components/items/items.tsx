import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
} from '@mantine/core';
import { useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@information-systems/translations';
import clsx from 'clsx';
import { useWatch } from 'react-hook-form';
import { useOptionsForm } from '../../_utils/options-form-context';
import { NormalItems } from './components/normal-items';
import { splitItems } from './utils/split-items';
import { ItemsProvider } from './utils/items-context';
import { useItemAmountModal } from './components/item-amount-modal/hooks/use-item-amount-modal';
import { ItemAmountModal } from './components/item-amount-modal';
import { GroupedItems } from './components/grouped-items';
import { ITEMS_COLUMNS, ITEMS_TABLE } from '@/utils/queries/items';
import type { Item } from '@/utils/queries/items';
import { supabase } from '@/utils/supabase/create-browser-client';

interface Props {
  items: Item[];
}

export function Items({ items }: Props) {
  const { t } = useTranslation();

  const optionsForm = useOptionsForm();
  const search = useWatch({ control: optionsForm.control, name: 'search' });
  const groupBy = useWatch({ control: optionsForm.control, name: 'groupBy' });

  const updateMutation = useUpdateMutation(
    supabase.from(ITEMS_TABLE),
    ['id'],
    ITEMS_COLUMNS,
    { meta: { showSuccessNotification: false, showLoadingNotification: false } }
  );

  const { openAmountModal, amountModalProps } = useItemAmountModal();

  const { checkedItems, uncheckedItems } = useMemo(
    () => splitItems(items),
    [items]
  );

  const [accordionValue, setAccordionValue] = useState<string | null>(() => {
    if (uncheckedItems.length === 0) return 'checked';
    return null;
  });
  useEffect(() => {
    if (search !== '') setAccordionValue('checked');
  }, [search]);

  return (
    <ItemsProvider value={{ updateMutation, search, openAmountModal }}>
      {groupBy !== 'none' ? (
        <GroupedItems items={uncheckedItems} />
      ) : (
        <NormalItems items={uncheckedItems} />
      )}
      <Accordion
        classNames={{
          content: '!p-0',
        }}
        value={accordionValue}
        onChange={setAccordionValue}
      >
        <AccordionItem
          value="checked"
          className={clsx(
            '!border-b-0',
            uncheckedItems.length === 0
              ? ''
              : 'mt-xs border-gray-3 dark:border-dark-4 border-0 border-t border-solid'
          )}
        >
          <AccordionControl
            className="!text-md !px-3 font-medium"
            disabled={checkedItems.length === 0}
          >
            {`${t({
              pt: 'Completados',
              en: 'Completed',
              es: 'Completados',
            })} (${checkedItems.length})`}
          </AccordionControl>
          <AccordionPanel>
            {groupBy !== 'none' ? (
              <GroupedItems items={checkedItems} />
            ) : (
              <NormalItems items={checkedItems} />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <ItemAmountModal {...amountModalProps} />
    </ItemsProvider>
  );
}
