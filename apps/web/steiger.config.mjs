import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // steiger 0.7 forbids essence-based segment names; "providers" is the
    // conventional FSD app-layer segment, keep it
    files: ['./src/app/providers.tsx'],
    rules: { 'fsd/segments-by-purpose': 'off' },
  },
]);
