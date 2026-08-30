import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['steiger.config.mjs', 'src/**/*.spec.ts'],
  ignore: ['src/shared/api/generated/**'],
  ignoreBinaries: ['rimraf', 'prettier'],
  ignoreExportsUsedInFile: true,
};

export default config;
