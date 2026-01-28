import type { RatingProps } from '@mantine/core';
import { Rating, Text } from '@mantine/core';
import {
  NumberCircleEightIcon,
  NumberCircleFiveIcon,
  NumberCircleFourIcon,
  NumberCircleNineIcon,
  NumberCircleOneIcon,
  NumberCircleSevenIcon,
  NumberCircleSixIcon,
  NumberCircleThreeIcon,
  NumberCircleTwoIcon,
} from '@phosphor-icons/react/dist/ssr';
import { NumberCircleTenIcon } from './number-circle-ten';

const indexToIcon = {
  1: { icon: NumberCircleOneIcon, color: 'red' },
  2: { icon: NumberCircleTwoIcon, color: 'red' },
  3: { icon: NumberCircleThreeIcon, color: 'orange' },
  4: { icon: NumberCircleFourIcon, color: 'orange' },
  5: { icon: NumberCircleFiveIcon, color: 'yellow' },
  6: { icon: NumberCircleSixIcon, color: 'yellow' },
  7: { icon: NumberCircleSevenIcon, color: 'lime' },
  8: { icon: NumberCircleEightIcon, color: 'lime' },
  9: { icon: NumberCircleNineIcon, color: 'green' },
  10: { icon: NumberCircleTenIcon, color: 'green' },
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
