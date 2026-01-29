import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import classes from './collapsible-navbar.module.css';

export interface CollapsibleNavbarProps
  extends Omit<ComponentProps<'div'>, 'onChange'> {
  children: ReactNode;
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  width?: string | number;
}

export function CollapsibleNavbar({
  children,
  className,
  expanded: expandedProp,
  onChange: onChangeProp,
  width,
  style,
  ...rest
}: CollapsibleNavbarProps) {
  const [expanded, onChange] = useUncontrolled({
    defaultValue: false,
    finalValue: false,
    value: expandedProp,
    onChange: onChangeProp,
  });

  return (
    <div
      className={className ? `${className} ${classes.root}` : classes.root}
      data-state={expanded ? 'expanded' : 'collapsed'}
      onMouseEnter={() => onChange(true)}
      onMouseLeave={() => onChange(false)}
      style={
        {
          '--collapsed-width': typeof width === 'number' ? `${width}px` : width,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
}
