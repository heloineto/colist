import { Check, X } from '@phosphor-icons/react/dist/ssr';
import classes from '../password-strength.module.css';

export interface PasswordRequirementProps {
  valid: boolean;
  label: string;
}

export function PasswordRequirement({
  valid,
  label,
}: PasswordRequirementProps) {
  return (
    <div className={classes.requirement} data-valid={valid}>
      {valid ? (
        <Check size="0.9rem" weight="bold" />
      ) : (
        <X size="0.9rem" weight="bold" />
      )}
      <div>{label}</div>
    </div>
  );
}
