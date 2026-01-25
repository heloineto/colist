import { createFormContext } from '@information-systems/mantine';

export const optionsInitialValues = {
  orderBy: 'name',
  orderDirection: 'ascending' as 'ascending' | 'descending',
  groupBy: 'category' as 'none' | 'category',
  search: '',
  searchOpened: false,
};

export type OptionsFieldValues = typeof optionsInitialValues;

export const [useOptionsFormProvider, useOptionsForm, OptionsFormProvider] =
  createFormContext({
    initialValues: optionsInitialValues,
  });
