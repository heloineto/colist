import type { MantineColor } from '@mantine/core';

const COLORS: MantineColor[] = [
  'blue',
  'cyan',
  'grape',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'red',
  'teal',
  'violet',
];

function hashCode(input: string) {
  let hash = 0;
  for (const char of input) {
    hash = (hash << 5) - hash + (char.codePointAt(0) ?? 0);
    hash |= 0;
  }
  return hash;
}

export function getColor(name: string) {
  return COLORS[Math.abs(hashCode(name)) % COLORS.length] ?? 'blue';
}

export function getInitials(name: string, limit = 2) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, limit).toUpperCase();
  return words
    .map((word) => word[0] ?? '')
    .slice(0, limit)
    .join('')
    .toUpperCase();
}
