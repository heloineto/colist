import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  test: {
    globals: true,
    root: './',
    exclude: ['dist', 'node_modules'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'packages/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.e2e-spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
        'packages/**/*.spec.ts',
        'packages/**/*.test.ts',
      ],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@packages': resolve(__dirname, './packages'),
    },
  },
});
