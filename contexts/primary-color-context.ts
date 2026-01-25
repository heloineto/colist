import { createSafeContext } from '@mantine/core';

interface PrimaryColorContext {
  primaryColor: string;
  setPrimaryColor: (value: string | ((previous: string) => string)) => void;
}

export const [PrimaryColorProvider, usePrimaryColor] =
  createSafeContext<PrimaryColorContext>(
    'PrimaryColorProvider component was not found in the tree'
  );
