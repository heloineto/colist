import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type Props = {
  icon: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md';
};

export function EmptyState({ icon: IconComponent, title, description, action, size = 'md' }: Props) {
  return (
    <div className="flex grow flex-col items-center justify-center gap-2 p-6 text-center">
      <IconComponent size={size === 'sm' ? '2.5rem' : '4rem'} className="text-dimmed" />
      <p className={size === 'sm' ? 'font-semibold' : 'text-lg font-semibold'}>{title}</p>
      {description && <p className="text-sm text-dimmed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
