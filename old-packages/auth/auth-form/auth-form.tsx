import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { usePathname, useRouter } from 'next/navigation';
import { useProps } from '@mantine/core';
import { FormsWrapper } from './components/forms-wrapper';
import { CopyrightNotice } from './components/copyright-notice';
import classes from './auth-form.module.css';
import { AuthFormHeader } from './components/auth-form-header';
import { type ValidSignInFieldValues } from './components/forms-wrapper/components/sign-in-form/hooks/use-sign-in-schema';
import { type ValidResetPasswordFieldValues } from './components/forms-wrapper/components/reset-password-form/hooks/use-reset-password-schema';
import { type ValidSignUpFieldValues } from './components/forms-wrapper/components/sign-up-form/hooks/use-sign-up-schema';
import { AuthFormProvider } from './contexts/auth-form-context';

export type AuthFormProps = {
  onSignIn: (values: ValidSignInFieldValues) => void | Promise<void>;
  onSignUp: (values: ValidSignUpFieldValues) => void | Promise<void>;
  logo?: string;
  title?: string;
  signUpFields?: {
    confirmPassword: boolean;
    name: boolean;
  };
  error?: string;
  success?: string;
} & (
  | {
      resetPassword: false;
      onResetPassword?: never;
    }
  | {
      resetPassword?: true;
      onResetPassword: (
        values: ValidResetPasswordFieldValues
      ) => void | Promise<void>;
    }
);

const defaultProps: Partial<AuthFormProps> = {
  resetPassword: false,
  signUpFields: {
    confirmPassword: true,
    name: false,
  },
};

// FUTURE: Handle "AuthApiError: For security purposes, you can only request this after 43 seconds.""
export function AuthForm(_props: AuthFormProps) {
  const props = useProps('AuthForm', defaultProps, _props);

  const { error, success } = props;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (error) {
      showNotification({ message: error, color: 'red', autoClose: 1000 * 3 });
      router.replace(pathname);
    }
    if (success) {
      showNotification({
        message: success,
        color: 'blue',
        autoClose: 1000 * 3,
      });
      router.replace(pathname);
    }
  }, [error, pathname, router, success]);

  return (
    <AuthFormProvider value={props}>
      <div className={classes.authForm}>
        <div className={classes.container}>
          <AuthFormHeader />
          <FormsWrapper />
        </div>
        <CopyrightNotice />
      </div>
    </AuthFormProvider>
  );
}
