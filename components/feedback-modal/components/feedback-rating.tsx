import {
  useTranslation,
  type TFunction,
} from '@/deprecated/packages/translations';
import { InputError, Rating } from '@mantine/core';
import clsx from 'clsx';
import { useMemo } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';
import { useController } from 'react-hook-form';

function getLabel(value: number | null, t: TFunction) {
  if (typeof value !== 'number') return null;

  const labels = [
    t({ en: 'Terrible', pt: 'Péssimo', es: 'Terrible' }),
    t({ en: 'Bad', pt: 'Ruim', es: 'Bad' }),
    t({ en: 'Okay', pt: 'Regular', es: 'Okay' }),
    t({ en: 'Good', pt: 'Bom', es: 'Good' }),
    t({ en: 'Excellent', pt: 'Excelente', es: 'Excellent' }),
  ];

  const index = value - 1;

  if (index >= labels.length) return null;

  return labels[value - 1];
}

export interface FeedbackRatingProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  className?: string;
}

export function FeedbackRating<T extends FieldValues>({
  className,
  ...rest
}: FeedbackRatingProps<T>) {
  const { field, fieldState } = useController<T>(rest);
  const { t } = useTranslation();
  const label = useMemo(() => getLabel(field.value, t), [field.value, t]);

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <Rating size="2.5rem" value={field.value} onChange={field.onChange} />
      {fieldState.error?.message ? (
        <InputError>{fieldState.error.message}</InputError>
      ) : null}
      {label ? <div>{label}</div> : null}
    </div>
  );
}
