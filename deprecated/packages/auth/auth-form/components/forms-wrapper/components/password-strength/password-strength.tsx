import { Progress } from '@mantine/core';
import { useWatch } from 'react-hook-form';
import { string, ZodIssueCode } from 'zod';
import {
  type TFunction,
  useTranslation,
} from '@/deprecated/packages/translations';
import { PasswordRequirement } from './components/password-requirement';
import classes from './password-strength.module.css';
import { requirements } from './utils/requirements';

export function getStrongPasswordSchema(t: TFunction) {
  return string().superRefine((v, ctx) => {
    for (const requirement of requirements) {
      if (!requirement.test(v)) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: t(requirement.error),
        });
      }
    }
  });
}

function getStrength(password: string) {
  let passes = 0;

  requirements.forEach((requirement) => {
    if (requirement.test(password)) {
      passes += 1;
    }
  });

  return (passes / requirements.length) * 100;
}

const BARS_COUNT = 4;

export interface PasswordStrengthProps {
  name: string;
}

export function PasswordStrength({ name }: PasswordStrengthProps) {
  const value = useWatch({ name }) as string;
  const strength = getStrength(value);
  const { t } = useTranslation();

  let color;

  if (strength > 75) {
    color = 'teal';
  } else if (strength > 50) {
    color = 'yellow';
  } else if (strength > 25) {
    color = 'orange';
  } else {
    color = 'red';
  }

  return (
    <div>
      <div className={classes.bars}>
        {Array.from({ length: BARS_COUNT }).map((_, index) => {
          const filled = strength >= ((index + 1) / BARS_COUNT) * 100;

          return (
            <Progress
              className={classes.progress}
              styles={{ section: { transitionDuration: '0ms' } }}
              value={filled ? 100 : 0}
              color={color}
              // eslint-disable-next-line react/no-array-index-key --- This is fine, since the array is static
              key={index}
              size={4}
            />
          );
        })}
      </div>
      {requirements.map((requirement) => (
        <PasswordRequirement
          key={requirement.label.en}
          label={t(requirement.label)}
          valid={requirement.test(value)}
        />
      ))}
    </div>
  );
}
