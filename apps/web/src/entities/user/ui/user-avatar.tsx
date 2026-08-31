import { Avatar, type AvatarProps } from '@mantine/core';
import { getColor, getInitials } from '@/entities/user/model/avatar';

type Props = AvatarProps & { name: string; image: string | null };

export function UserAvatar({ name, image, ...props }: Props) {
  return (
    <Avatar
      radius="xl"
      src={image}
      color={getColor(getInitials(name))}
      {...props}
    >
      {getInitials(name)}
    </Avatar>
  );
}
