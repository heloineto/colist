import { useTranslation } from '@information-systems/translations';
import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { useWatch } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';
import { useItemForm } from '@/app/app/_utils/item-form-context';

interface Props
  extends
    ButtonProps,
    Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps> {}

export function SubmitItemButton({ ...rest }: Props) {
  const form = useItemForm();
  const { t } = useTranslation();

  const id = useWatch({ control: form.control, name: 'id' });
  const name = useWatch({ control: form.control, name: 'name' });

  return (
    <Button
      className={id ? '' : 'disabled:bg-transparent'}
      variant={id ? 'light' : 'subtle'}
      mr={-8}
      px={id ? undefined : 'xs'}
      type="submit"
      disabled={!name}
      {...rest}
    >
      {id
        ? t({ pt: 'Salvar', en: 'Save', es: 'Guardar' })
        : t({ pt: 'Adicionar', en: 'Add', es: 'Añadir' })}
    </Button>
  );
}
