import type { RatingProps } from '@mantine/core';
import { Rating, Text } from '@mantine/core';
import {
  NumberCircleEight,
  NumberCircleFive,
  NumberCircleFour,
  NumberCircleNine,
  NumberCircleOne,
  NumberCircleSeven,
  NumberCircleSix,
  NumberCircleThree,
  NumberCircleTwo,
} from '@phosphor-icons/react/dist/ssr';
import { NumberCircleTen } from './number-circle-ten';

const indexToIcon = {
  1: { icon: NumberCircleOne, color: 'red' },
  2: { icon: NumberCircleTwo, color: 'red' },
  3: { icon: NumberCircleThree, color: 'orange' },
  4: { icon: NumberCircleFour, color: 'orange' },
  5: { icon: NumberCircleFive, color: 'yellow' },
  6: { icon: NumberCircleSix, color: 'yellow' },
  7: { icon: NumberCircleSeven, color: 'lime' },
  8: { icon: NumberCircleEight, color: 'lime' },
  9: { icon: NumberCircleNine, color: 'green' },
  10: { icon: NumberCircleTen, color: 'green' },
};

const getEmptyIcon = (value: number) => {
  if (!(value in indexToIcon)) return null;

  const Icon = indexToIcon[value as keyof typeof indexToIcon].icon;

  return <Icon color="var(--mantine-color-dimmed)" size="2.25rem" />;
};

function getFullSymbol(value: number) {
  if (!(value in indexToIcon)) return null;

  const Icon = indexToIcon[value as keyof typeof indexToIcon].icon;
  const color = indexToIcon[value as keyof typeof indexToIcon].color;

  return (
    <Icon
      color={`var(--mantine-color-${color}-filled`}
      size="2.25rem"
      weight="fill"
    />
  );
}

export interface NpsRatingProps extends RatingProps {
  error?: string | null;
}

export function NpsRating({ error, ...rest }: NpsRatingProps) {
  return (
    <>
      <Rating
        h="2.25rem"
        emptySymbol={getEmptyIcon}
        fullSymbol={getFullSymbol}
        highlightSelectedOnly
        count={10}
        {...rest}
      />
      {error ? (
        <Text c="red" size="xs">
          {error}
        </Text>
      ) : null}
    </>
  );
}
