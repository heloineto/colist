export const requirements = [
  {
    test: (v: string) => v.length >= 8,
    label: {
      en: 'Has at least 8 characters',
      pt: 'Tem pelo menos 8 caracteres',
      es: 'Tiene al menos 8 caracteres',
    },
    error: {
      en: 'Password must have at least 8 characters',
      pt: 'A senha deve ter pelo menos 8 caracteres',
      es: 'La contraseña debe tener al menos 8 caracteres',
    },
  },
  {
    test: (v: string) => /[0-9]/.test(v),
    label: {
      en: 'Includes a number',
      pt: 'Inclui número',
      es: 'Incluye número',
    },
    error: {
      en: 'Password must have at least one number',
      pt: 'A senha deve ter pelo menos um número',
      es: 'La contraseña debe tener al menos un número',
    },
  },
  {
    test: (v: string) => /[a-z]/.test(v),
    label: {
      en: 'Includes a lowercase letter',
      pt: 'Inclui letra minúscula',
      es: 'Incluye letra minúscula',
    },
    error: {
      en: 'Password must have at least one lowercase letter',
      pt: 'A senha deve ter pelo menos uma letra minúscula',
      es: 'La contraseña debe tener al menos una letra minúscula',
    },
  },
  {
    test: (v: string) => /[A-Z]/.test(v),
    label: {
      en: 'Includes an uppercase letter',
      pt: 'Inclui letra maiúscula',
      es: 'Incluye letra mayúscula',
    },
    error: {
      en: 'Password must have at least one uppercase letter',
      pt: 'A senha deve ter pelo menos uma letra maiúscula',
      es: 'La contraseña debe tener al menos una letra mayúscula',
    },
  },
];
