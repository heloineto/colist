import type { ActionIconProps } from '@mantine/core';
import { ActionIcon } from '@mantine/core';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr';
import type { ComponentPropsWithoutRef } from 'react';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from '@/deprecated/packages/translations';
import { useItemForm } from '@/app/app/_utils/item-form-context';
import { useListContext } from '@/app/app/_utils/list-context';

interface Props
  extends
    ActionIconProps,
    Omit<ComponentPropsWithoutRef<'button'>, keyof ActionIconProps> {}

export function AddButton({ ...rest }: Props) {
  const { listId } = useListContext();
  const { t } = useTranslation();
  const itemForm = useItemForm();

  return (
    <div className="mr-lg absolute top-0 right-0 h-full">
      <svg
        className="dark:fill-dark-7 absolute top-0 left-1/2 -translate-x-1/2 fill-white"
        width="86"
        height="55"
        viewBox="0 0 86 55"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1.69674 0C0.592107 3.80865 0 7.83518 0 12C0 35.7482 19.2518 55 43 55C66.7482 55 86 35.7482 86 12C86 7.83518 85.4079 3.80865 84.3033 0H1.69674Z" />
      </svg>

      <ActionIcon
        className="-mt-6 border-none!"
        variant="filled"
        radius="4.5rem"
        onClick={() => {
          if (listId !== null) {
            showNotification({
              message: t({
                pt: 'Nenhuma lista selecionada',
                en: 'No list selected',
                es: 'No se ha seleccionado ninguna lista',
              }),
              color: 'red',
            });

            return;
          }
          itemForm.disclosure.open();
        }}
        size="4.5rem"
        {...rest}
      >
        <PlusIcon size="2rem" />
      </ActionIcon>
    </div>
  );
}
