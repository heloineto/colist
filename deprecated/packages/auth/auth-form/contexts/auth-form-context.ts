import { createSafeContext } from '@mantine/core';
import { type AuthFormProps } from '../auth-form';

export const [AuthFormProvider, useAuthFormContext] =
  createSafeContext<AuthFormProps>(
    'AuthFormProvider component was not found in tree'
  );
