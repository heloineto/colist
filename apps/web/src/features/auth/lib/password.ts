export const PASSWORD_RULES = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'number', test: (value: string) => /\d/.test(value) },
  { key: 'lower', test: (value: string) => /[a-z]/.test(value) },
  { key: 'upper', test: (value: string) => /[A-Z]/.test(value) },
] as const;

export function passwordStrength(value: string) {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  return (passed / PASSWORD_RULES.length) * 100;
}

export function isStrongPassword(value: string) {
  return passwordStrength(value) === 100;
}
