import { Avatar } from '@mantine/core';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr';
import { useAuthFormContext } from '../../contexts/auth-form-context';
import classes from './auth-form-header.module.css';

export function AuthFormHeader() {
  const { title, logo } = useAuthFormContext();

  if (!title && !logo) return null;

  return (
    <div className={classes.authFormHeader}>
      <Avatar size="lg" radius="xs" src={logo}>
        <BuildingsIcon size="2.375rem" />
      </Avatar>
      {title ? <div className={classes.title}>{title}</div> : null}
    </div>
  );
}
