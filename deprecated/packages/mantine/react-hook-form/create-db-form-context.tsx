import { type FieldValues } from 'react-hook-form';
import { type ReactNode, useMemo } from 'react';
import {
  createFormContext,
  type Form,
  type FormProps,
} from './create-form-context';

export interface ExtraDbFormInput<
  TFieldValues extends FieldValues = FieldValues,
  TValidFieldValues extends TFieldValues = TFieldValues,
  TDatabaseValues = unknown,
> {
  toDatabase: (values: TValidFieldValues) => TDatabaseValues;
  fromDatabase: (values: TDatabaseValues) => TValidFieldValues;
}

export function createDbFormContext<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
  TValidFieldValues extends TFieldValues = TFieldValues,
  TDatabaseValues = unknown,
>(
  contextProps: FormProps<
    TFieldValues,
    TContext,
    TValidFieldValues,
    TTransformedValues
  > &
    ExtraDbFormInput<TFieldValues, TValidFieldValues, TDatabaseValues>
) {
  type CurrentForm = Form<
    TFieldValues,
    TContext,
    TTransformedValues,
    TValidFieldValues
  > &
    ExtraDbFormInput<TFieldValues, TValidFieldValues, TDatabaseValues>;

  const [_useFormProvider, useFormContext, FormProvider] = createFormContext<
    TFieldValues,
    TContext,
    TTransformedValues,
    TValidFieldValues
  >(contextProps);

  function useFormProvider(
    providerProps?: Partial<
      FormProps<TFieldValues, TContext, TValidFieldValues, TTransformedValues>
    >
  ): CurrentForm {
    const props = useMemo(
      () => ({ ...contextProps, ...providerProps }),
      [providerProps]
    );
    const { fromDatabase, toDatabase } = props;

    const form = _useFormProvider(props);

    return {
      ...form,
      fromDatabase,
      toDatabase,
    } as CurrentForm;
  }

  return [
    useFormProvider,
    useFormContext,
    FormProvider,
    contextProps,
  ] as unknown as [
    typeof useFormProvider,
    () => CurrentForm,
    (props: { children: ReactNode; form: CurrentForm }) => ReactNode,
    typeof contextProps,
  ];
}
