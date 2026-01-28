import { type ReactNode } from 'react';
import classes from '../../forms-wrapper.module.css';

export interface FormHeaderProps {
  title: ReactNode;
  subtitle: ReactNode;
}

export function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <div className={classes.formHeader}>
      <h1 className={classes.formTitle}>{title}</h1>
      <div className={classes.formSubtitle}>{subtitle}</div>
    </div>
  );
}
