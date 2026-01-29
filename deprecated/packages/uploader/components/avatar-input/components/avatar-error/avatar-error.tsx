import type { AvatarProps } from '@mantine/core';
import { getRadius, getSize } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import classes from '../../avatar-input.module.css';

export function AvatarError({
  size: sizeProp,
  radius: radiusProp = 1000,
}: AvatarProps) {
  const size = getSize(sizeProp ?? 'md', 'avatar-size');
  const radius = getRadius(radiusProp);

  return (
    <div
      className={classes.avatarState}
      style={{
        height: size,
        width: size,
        borderRadius: radius,
      }}
      data-state="error"
    >
      <WarningIcon size="65%" />
    </div>
  );
}
