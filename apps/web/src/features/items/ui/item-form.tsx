import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  HashIcon,
  type Icon,
  NumberCircleEightIcon,
  NumberCircleFiveIcon,
  NumberCircleFourIcon,
  NumberCircleNineIcon,
  NumberCircleOneIcon,
  NumberCircleSevenIcon,
  NumberCircleSixIcon,
  NumberCircleThreeIcon,
  NumberCircleTwoIcon,
  TextAlignLeftIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invalidateList, useSelectedList } from '@/entities/list';
import { useItemForm } from '@/features/items/model/item-form-context';
import { AmountModal } from '@/features/items/ui/amount-modal';
import { CategoryButton } from '@/features/items/ui/category-picker';
import {
  useItemsCreate,
  useItemsDelete,
  useItemsUpdate,
} from '@/shared/api/generated/items/items';
import { confirmDelete } from '@/shared/ui/confirm';

const NUMBER_ICONS: Icon[] = [
  NumberCircleOneIcon,
  NumberCircleTwoIcon,
  NumberCircleThreeIcon,
  NumberCircleFourIcon,
  NumberCircleFiveIcon,
  NumberCircleSixIcon,
  NumberCircleSevenIcon,
  NumberCircleEightIcon,
  NumberCircleNineIcon,
];

const EMPTY = {
  name: '',
  details: '',
  amount: 1,
  categoryId: null as number | null,
};

export function ItemForm() {
  const { t } = useTranslation();
  const { opened, item, close } = useItemForm();
  const { listId } = useSelectedList();
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [amountOpened, amountModal] = useDisclosure(false);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const form = useForm({ initialValues: EMPTY });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      item
        ? {
            name: item.name,
            details: item.details ?? '',
            amount: item.amount,
            categoryId: item.categoryId,
          }
        : EMPTY
    );
    setDetailsOpened(Boolean(item?.details));
  }, [opened, item]);

  const settled = () => {
    if (listId !== null) invalidateList(listId);
  };
  const create = useItemsCreate({ mutation: { onSettled: settled } });
  const update = useItemsUpdate({ mutation: { onSettled: settled } });
  const remove = useItemsDelete({ mutation: { onSettled: settled } });

  const submit = form.onSubmit((values) => {
    if (listId === null) return;
    const data = {
      name: values.name.trim(),
      amount: values.amount,
      categoryId: values.categoryId,
      details: values.details.trim() || null,
    };
    if (item) update.mutate({ listId, itemId: item.id, data });
    else {
      create.mutate({
        listId,
        data: { ...data, clientId: crypto.randomUUID() },
      });
    }
    close();
  });

  const toggleDetails = () => {
    if (detailsOpened) {
      form.setFieldValue('details', '');
      setDetailsOpened(false);
      return;
    }
    setDetailsOpened(true);
    setTimeout(() => detailsRef.current?.focus(), 0);
  };

  const AmountIcon = NUMBER_ICONS[form.values.amount - 1] ?? HashIcon;

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="bottom"
      withCloseButton={false}
      classNames={{ content: 'rounded-t-lg! h-fit!', body: 'pt-2!' }}
    >
      <form className="flex flex-col" onSubmit={submit}>
        <TextInput
          variant="unstyled"
          size="lg"
          type="search"
          data-autofocus
          autoComplete="off"
          placeholder={t('items.newItem')}
          classNames={{ input: 'h-9! min-h-9!' }}
          {...form.getInputProps('name')}
        />
        <Textarea
          ref={detailsRef}
          variant="unstyled"
          autosize
          placeholder={t('items.addDetails')}
          className={detailsOpened ? '-mt-2' : 'hidden'}
          classNames={{ input: 'text-gray-800! dark:text-dark-100!' }}
          {...form.getInputProps('details')}
        />
        <div className="flex items-center justify-between">
          <div className="-ml-2 flex items-center">
            <Tooltip label={t('items.details')}>
              <ActionIcon
                variant={detailsOpened ? 'light' : 'subtle'}
                size="lg"
                color={detailsOpened ? undefined : 'gray'}
                onClick={toggleDetails}
                aria-label={t('items.details')}
              >
                <TextAlignLeftIcon size="1.25rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('items.amount.title')}>
              <ActionIcon
                variant="subtle"
                size="lg"
                color="gray"
                onClick={amountModal.open}
                aria-label={t('items.amount.title')}
              >
                <AmountIcon size="1.25rem" />
                {form.values.amount > 9 && (
                  <Badge size="xs" variant="light" className="ml-1">
                    {form.values.amount}
                  </Badge>
                )}
              </ActionIcon>
            </Tooltip>
            {listId !== null && (
              <CategoryButton
                listId={listId}
                value={form.values.categoryId}
                onChange={(categoryId) =>
                  form.setFieldValue('categoryId', categoryId)
                }
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {item && listId !== null && (
              <Button
                color="red"
                variant="light"
                onClick={() =>
                  confirmDelete(
                    t('items.deleteLabel', { name: item.name }),
                    () => {
                      remove.mutate({ listId, itemId: item.id });
                      close();
                    }
                  )
                }
              >
                {t('common.remove')}
              </Button>
            )}
            <Button
              type="submit"
              variant={item ? 'light' : 'subtle'}
              className="-mr-2"
              px={item ? undefined : 'xs'}
              disabled={!form.values.name.trim()}
            >
              {item ? t('common.save') : t('common.add')}
            </Button>
          </div>
        </div>
      </form>
      <AmountModal
        opened={amountOpened}
        value={form.values.amount}
        onChange={(amount) => form.setFieldValue('amount', amount)}
        onClose={amountModal.close}
      />
    </Drawer>
  );
}
