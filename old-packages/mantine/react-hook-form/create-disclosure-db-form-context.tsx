import { type FieldValues } from 'react-hook-form';
import { type ReactNode } from 'react';
import { type Disclosure, useDisclosure } from '../hooks/use-disclosure';
import { DiscardModal } from '../components';
import { type Form, type FormProps } from './create-form-context';
import {
  createDbFormContext,
  type ExtraDbFormInput,
} from './create-db-form-context';

export interface ExtraDisclosureDbFormInput<
  TFieldValues extends FieldValues = FieldValues,
  TValidFieldValues extends TFieldValues = TFieldValues,
  TDatabaseValues = unknown,
> extends ExtraDbFormInput<TFieldValues, TValidFieldValues, TDatabaseValues> {
  initialOpened?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export function createDisclosureDbFormContext<
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
    ExtraDisclosureDbFormInput<TFieldValues, TValidFieldValues, TDatabaseValues>
) {
  type CustomDisclosure = Disclosure & {
    close: (params: { confirmation?: boolean }) => void;
  };

  type CurrentForm = Form<
    TFieldValues,
    TContext,
    TTransformedValues,
    TValidFieldValues
  > &
    ExtraDisclosureDbFormInput<
      TFieldValues,
      TValidFieldValues,
      TDatabaseValues
    > & {
      disclosure: CustomDisclosure;
      discardDisclosure: Disclosure;
    };

  const [_useFormProvider, useFormContext, _FormProvider] = createDbFormContext<
    TFieldValues,
    TContext,
    TTransformedValues,
    TValidFieldValues,
    TDatabaseValues
  >(contextProps);

  function useFormProvider(
    providerProps?: Partial<
      FormProps<TFieldValues, TContext, TValidFieldValues, TTransformedValues> &
        ExtraDisclosureDbFormInput<
          TFieldValues,
          TValidFieldValues,
          TDatabaseValues
        >
    >
  ) {
    const form = _useFormProvider(providerProps);

    const disclosure = useDisclosure(
      contextProps.initialOpened || providerProps?.initialOpened,
      {
        onClose: () => {
          contextProps.onClose?.();
          providerProps?.onClose?.();
        },
        onOpen: () => {
          contextProps.onOpen?.();
          providerProps?.onOpen?.();
        },
      }
    );
    const discardDisclosure = useDisclosure();
    const { isDirty } = form.formState;

    return {
      ...form,
      disclosure: {
        ...disclosure,
        close: ({ confirmation = true } = {}) => {
          if (!confirmation || !isDirty) {
            disclosure.close();
            return;
          }
          discardDisclosure.open();
        },
      },
      discardDisclosure,
    } as CurrentForm;
  }

  function FormProvider({
    children,
    form,
  }: {
    children: ReactNode;
    form: CurrentForm;
  }) {
    return (
      <_FormProvider form={form}>
        {children}
        <DiscardModal
          onClose={form.discardDisclosure.close}
          opened={form.discardDisclosure.opened}
          onConfirm={() => form.disclosure.close({ confirmation: false })}
          modalProps={{ zIndex: 300 }}
        />
      </_FormProvider>
    );
  }

  return [useFormProvider, useFormContext, FormProvider, contextProps] as [
    typeof useFormProvider,
    () => CurrentForm,
    typeof FormProvider,
    typeof contextProps,
  ];
}
