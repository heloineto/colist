import { Progress } from '@mantine/core';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { PASSWORD_RULES, passwordStrength } from '@/features/auth/lib/password';

function barColor(strength: number) {
  if (strength > 75) return 'teal';
  if (strength > 50) return 'yellow';
  if (strength > 25) return 'orange';
  return 'red';
}

export function PasswordStrength({ value }: { value: string }) {
  const { t } = useTranslation();
  const strength = passwordStrength(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex gap-1">
        {PASSWORD_RULES.map((rule, index) => (
          <Progress
            key={rule.key}
            className="grow"
            size={4}
            color={barColor(strength)}
            value={strength >= ((index + 1) / PASSWORD_RULES.length) * 100 ? 100 : 0}
            styles={{ section: { transitionDuration: '0ms' } }}
          />
        ))}
      </div>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <div
            key={rule.key}
            className={`flex items-center gap-2 text-sm ${ok ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400'}`}
          >
            {ok ? <CheckIcon size="0.9rem" weight="bold" /> : <XIcon size="0.9rem" weight="bold" />}
            {t(`auth.strength.${rule.key}`)}
          </div>
        );
      })}
    </div>
  );
}
