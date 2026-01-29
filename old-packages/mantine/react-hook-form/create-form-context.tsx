import { createContext, type ReactNode, useContext, useMemo } from 'react';
import {
  type TFunction,
  useTranslation,
} from '@information-systems/translations';
import { type ZodSchema } from 'zod';
import {
  type DefaultValues,
  type FieldValues,
  useForm,
  type UseFormHandleSubmit,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// FUTURE: Prevent browser page from closing when form is dirty

export interface ExtraFormInput<
  TFieldValues extends FieldValues = FieldValues,
  TValidFieldValues extends TFieldValues = TFieldValues,
> {
  getSchema?: (t: TFunction) => ZodSchema<TValidFieldValues>;
  initialValues: DefaultValues<TFieldValues>;
}

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TValidFieldValues extends TFieldValues = TFieldValues,
  TTransformedValues = TFieldValues,
>
  extends
    UseFormProps<TFieldValues, TContext, TTransformedValues>,
    ExtraFormInput<TFieldValues, TValidFieldValues> {}

export interface Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
  TValidFieldValues extends TFieldValues = TFieldValues,
>
  extends
    UseFormReturn<TFieldValues, TContext, TTransformedValues>,
    ExtraFormInput<TFieldValues, TValidFieldValues> {
  handleSubmit: UseFormHandleSubmit<TValidFieldValues, TTransformedValues>;
}

export type ValidFieldValues<T> = T extends {
  getSchema?: (t: TFunction) => ZodSchema<infer TValidFieldValues>;
}
  ? TValidFieldValues
  : never;

export function createFormContext<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
  TValidFieldValues extends TFieldValues = TFieldValues,
>(
  contextProps: FormProps<
    TFieldValues,
    TContext,
    TValidFieldValues,
    TTransformedValues
  >
) {
  type CurrentForm = Form<
    TFieldValues,
    TContext,
    TTransformedValues,
    TValidFieldValues
  >;

  const FormContext = createContext<CurrentForm | null>(null);

  function useFormProvider(
    providerProps?: Partial<
      FormProps<TFieldValues, TContext, TValidFieldValues, TTransformedValues>
    >
  ): CurrentForm {
    const { t } = useTranslation();

    const props = useMemo(
      () => ({ ...contextProps, ...providerProps }),
      [providerProps]
    );
    const { getSchema, initialValues } = props;

    const resolver = useMemo(() => {
      if (!getSchema) return undefined;
      const schema = getSchema(t);
      return zodResolver(schema);
    }, [getSchema, t]);

    const form = useForm<TFieldValues, TContext, TTransformedValues>({
      defaultValues: initialValues,
      resolver,
      ...props,
    });

    return useMemo(() => {
      const handleSubmit: UseFormHandleSubmit<
        TFieldValues,
        TTransformedValues
      > = (
        onValid,
        onInvalid = (errors, event) => console.error(errors, event)
      ) => {
        return form.handleSubmit(onValid, onInvalid);
      };

      return {
        ...form,
        initialValues,
        getSchema,
        handleSubmit,
      } as CurrentForm;
    }, [form, initialValues, getSchema]);
  }

  function useFormContext(): CurrentForm {
    const ctx = useContext(FormContext);
    if (!ctx) {
      throw new Error(
        'useFormContext was called outside of FormProvider context'
      );
    }
    return ctx;
  }

  function FormProvider({
    children,
    form,
  }: {
    children: ReactNode;
    form: CurrentForm;
  }) {
    return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
  }

  return [useFormProvider, useFormContext, FormProvider, contextProps] as [
    typeof useFormProvider,
    typeof useFormContext,
    typeof FormProvider,
    typeof contextProps,
  ];
}
