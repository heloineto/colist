import { useTranslation } from '@/deprecated/packages/translations';
import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { useWatch } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';
import { useItemForm } from '@/app/app/utils/item-form-context';

interface Props
  extends
    ButtonProps,
    Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps> {}

export function SubmitItemButton({ ...rest }: Props) {
  const itemForm = useItemForm();
  const { t } = useTranslation();

  const id = useWatch({ control: itemForm.control, name: 'id' });
  const name = useWatch({ control: itemForm.control, name: 'name' });

  const hasId = id !== null;

  return (
    <Button
      className={hasId ? '' : 'disabled:bg-transparent'}
      variant={hasId ? 'light' : 'subtle'}
      mr={-8}
      px={hasId ? undefined : 'xs'}
      type="submit"
      disabled={!name}
      {...rest}
    >
      {hasId
        ? t({ pt: 'Salvar', en: 'Save', es: 'Guardar' })
        : t({ pt: 'Adicionar', en: 'Add', es: 'Añadir' })}
    </Button>
  );
}
