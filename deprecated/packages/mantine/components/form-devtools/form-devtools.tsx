/* eslint-disable no-console --- development only component */
import type { Control, FieldValues } from 'react-hook-form';
import { useFormState, useWatch } from 'react-hook-form';

export interface FormDevtoolsProps<T extends FieldValues> {
  hidden?: boolean;
  log?: boolean;
  control?: Control<T> | undefined;
}

export function FormDevtools<T extends FieldValues>({
  hidden,
  control,
  log = true,
}: FormDevtoolsProps<T>) {
  const values = useWatch({ control });
  const { errors } = useFormState({ control });

  if (log) {
    console.log('values', values);
    console.log('errors', errors);
  }

  if (hidden) return null;

  return (
    <div>
      <pre className="font-mono text-xs">{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}
