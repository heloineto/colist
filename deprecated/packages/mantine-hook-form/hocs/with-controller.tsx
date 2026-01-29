import type {
  ComponentType,
  ReactNode,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form';
import { useController } from 'react-hook-form';

export function withController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any --- This is fine since it's a generic (unknown won't work)
  TOnChange extends (...args: any[]) => any,
  TProps extends {
    error?: ReactNode;
    onChange?: TOnChange | undefined;
  },
>(
  Component:
    | ComponentType<TProps>
    | ForwardRefExoticComponent<TProps & RefAttributes<unknown>>,
  {
    type = 'input',
  }: {
    type: 'input' | 'checkbox';
  } = {
    type: 'input',
  }
) {
  function WithHookForm<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  >(
    props: TProps &
      UseControllerProps<TFieldValues, TName> & {
        transformValue?: (...params: Parameters<TOnChange>) => unknown;
      }
  ) {
    const {
      name,
      rules,
      shouldUnregister,
      defaultValue,
      control,
      disabled,
      onChange,
      transformValue,
      ...rest
    } = props;

    const { field, fieldState } = useController<TFieldValues, TName>({
      name,
      control,
      defaultValue,
      rules,
      shouldUnregister,
      disabled,
    });

    const componentProps = { ...rest } as unknown as TProps;

    componentProps.error = fieldState.error?.message;
    componentProps.onChange = ((...e: Parameters<TOnChange>) => {
      const params = transformValue ? [transformValue(...e)] : e;
      field.onChange(...params);
      onChange?.(...e);
    }) as TOnChange;

    const additionalProps: Record<string, unknown> = {
      onBlur: field.onBlur,
      disabled: field.disabled,
      name: field.name,
    };

    if (type === 'checkbox') {
      additionalProps.checked = field.value;
    } else {
      additionalProps.value = field.value;
    }

    return (
      <Component {...componentProps} {...additionalProps} ref={field.ref} />
    );
  }

  return WithHookForm;
}
