import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@packages': resolve(__dirname, '../packages'),
    },
  },
  test: {
    globals: true,
    root: resolve(__dirname, '../'),
    include: ['**/*.e2e-spec.ts'],
    globalSetup: [resolve(__dirname, 'global-setup.ts')],
  },
});
