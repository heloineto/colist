import { type ComponentType, type ForwardedRef, forwardRef } from 'react';
import classes from './with-absolute.module.css';

export function withAbsolute<TRef, TProps = Record<string, never>>(
  Component: ComponentType<TProps>
) {
  function WithAbsoluteComponent(
    {
      className,
      height,
      ...rest
    }: TProps & { className?: string; height?: number | string },
    ref: ForwardedRef<TRef>
  ) {
    return (
      <div className={classes.wrapper} style={{ height }}>
        <Component
          ref={ref}
          className={
            className ? `${className} ${classes.component}` : classes.component
          }
          {...(rest as TProps)}
        />
      </div>
    );
  }

  // @ts-expect-error --- TODO: Fix with React 19
  return forwardRef(WithAbsoluteComponent);
}
