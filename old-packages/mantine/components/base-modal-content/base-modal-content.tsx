import { ModalCloseButton, Text, Title } from '@mantine/core';
import { type CSSProperties, type ReactNode } from 'react';
import classes from './base-modal-content.module.css';

export interface BaseModalContentProps {
  title: string;
  description: string;
  buttons: ReactNode;
  icon: ReactNode;
  styles?: {
    root?: CSSProperties;
    body?: CSSProperties;
    iconWrapper?: CSSProperties;
    textWrapper?: CSSProperties;
    closeButton?: CSSProperties;
    buttons?: CSSProperties;
  };
}

export function BaseModalContent({
  title,
  description,
  buttons,
  styles,
  icon,
}: BaseModalContentProps) {
  return (
    <div className={classes.root} style={styles?.root}>
      <div className={classes.body} style={styles?.body}>
        <div className={classes.iconWrapper} style={styles?.iconWrapper}>
          {icon}
        </div>
        <div className={classes.textWrapper} style={styles?.textWrapper}>
          <Title order={2} size="h4">
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </div>
        <ModalCloseButton
          className={classes.closeButton}
          style={styles?.closeButton}
        />
      </div>
      <div className={classes.buttons} style={styles?.buttons}>
        {buttons}
      </div>
    </div>
  );
}
