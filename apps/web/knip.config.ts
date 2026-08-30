import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['steiger.config.mjs'],
  ignoreBinaries: ['rimraf'],
  ignoreExportsUsedInFile: true,
};

export default config;
