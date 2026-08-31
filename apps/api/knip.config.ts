import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignoreBinaries: ['rimraf'],
  ignoreDependencies: ['pino-pretty'],
  ignoreExportsUsedInFile: true,
};

export default config;
