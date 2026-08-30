import { createIndependentModules } from 'eslint-plugin-project-structure';
import { createFolderStructure } from 'eslint-plugin-project-structure';

export const folderStructureConfig = createFolderStructure({
  structure: [
    { name: '*' },
    { name: '*', children: [] },
    {
      name: 'src',
      children: [
        { name: 'main.ts' },
        { name: 'app.module.ts' },
        { ruleId: 'common_folder' },
        { ruleId: 'core_folder' },
        { ruleId: 'feature_folder' },
      ],
    },
  ],
  rules: {
    common_folder: {
      name: 'common',
      children: [
        { ruleId: 'application_layer' },
        { ruleId: 'infrastructure_layer' },
        { ruleId: 'presentation_layer' },
      ],
    },

    core_folder: {
      name: 'core',
      children: [
        { name: '{kebab-case}.module.ts' },
        {
          name: 'presentation',
          children: [
            {
              name: '{kebab-case}',
              children: [{ name: '{kebab-case}.setup.ts' }],
            },
          ],
        },
      ],
    },

    feature_folder: {
      name: '{kebab-case}',
      children: [
        { name: '{folder-name}.module.ts' },
        { ruleId: 'domain_layer' },
        { ruleId: 'application_layer' },
        { ruleId: 'infrastructure_layer' },
        { ruleId: 'presentation_layer' },
        { ruleId: 'test_layer' },
      ],
    },

    test_layer: {
      name: 'test',
      children: [{ name: '{kebab-case}.mock.ts' }],
    },

    domain_layer: {
      name: 'domain',
      children: [
        { name: '{kebab-case}.ts' },
        {
          name: 'value-objects',
          children: [{ name: '{kebab-case}.ts' }],
        },
        {
          name: 'factories',
          children: [{ name: '{kebab-case}.factory.ts' }],
        },
      ],
    },

    application_layer: {
      name: 'application',
      children: [
        { name: '{kebab-case}.service.ts' },
        { name: '{kebab-case}.service.spec.ts' },
        {
          name: 'use-cases',
          children: [
            { name: '{kebab-case}.use-case.ts' },
            { name: '{kebab-case}.use-case.spec.ts' },
          ],
        },
        {
          name: 'ports',
          children: [{ name: '{kebab-case}.{kebab-case}.ts' }],
        },
        {
          name: 'dtos',
          children: [{ name: '{kebab-case}.dto.ts' }],
        },
        {
          name: 'utils',
          children: [{ name: '{kebab-case}.util.ts' }],
        },
      ],
    },

    infrastructure_layer: {
      name: 'infrastructure',
      children: [
        { name: '{kebab-case}.module.ts' },
        { name: '{kebab-case}.service.ts' },
        {
          name: 'persistence',
          children: [{ ruleId: 'persistence_driver_folder' }],
        },
        {
          name: 'config',
          children: [{ name: '{kebab-case}.{kebab-case}.ts' }],
        },
        {
          name: 'transformers',
          children: [{ name: '{kebab-case}.transformer.ts' }],
        },
        {
          name: 'utils',
          children: [{ name: '{kebab-case}.util.ts' }],
        },
        { ruleId: 'adapter_folder' },
      ],
    },

    adapter_folder: {
      name: '{kebab-case}',
      children: [
        { name: '{kebab-case}.module.ts' },
        { name: '{kebab-case}.ts' },
        { name: '{kebab-case}.spec.ts' },
      ],
    },

    persistence_driver_folder: {
      name: '{kebab-case}',
      children: [
        { name: '{kebab-case}.module.ts' },
        { name: '{kebab-case}.ts' },
        { name: '{kebab-case}.schema.ts' },
        {
          name: 'mappers',
          children: [{ name: '{kebab-case}.mapper.ts' }],
        },
        {
          name: 'repositories',
          children: [{ name: '{kebab-case}.repository.ts' }],
        },
      ],
    },

    presentation_layer: {
      name: 'presentation',
      children: [{ ruleId: 'transport_folder' }],
    },

    transport_folder: {
      name: '{kebab-case}',
      children: [
        { name: '{kebab-case}.{kebab-case}.spec.ts' },
        { name: '{kebab-case}.{kebab-case}.ts' },
        {
          name: 'dto',
          children: [{ name: '{kebab-case}.dto.ts' }],
        },
        {
          name: 'guards',
          children: [{ name: '{kebab-case}.guard.ts' }],
        },
        {
          name: 'decorators',
          children: [{ name: '{kebab-case}.decorator.ts' }],
        },
      ],
    },
  },
});

export const independentModulesConfig = createIndependentModules({
  pathAliases: {
    baseUrl: 'apps/api',
    paths: { '@/*': ['./src/*'], '@packages/*': ['./packages/*'] },
  },
  packageRoot: 'apps/api',
  modules: [
    {
      name: 'packages',
      pattern: 'packages/**',
      allowImportsFrom: ['packages/**'],
      errorMessage: 'packages/ can only import from itself.',
    },
    {
      name: 'migrations',
      pattern: 'migrations/**',
      allowImportsFrom: ['src/common/**', 'migrations/**'],
      errorMessage: 'migrations/ can only import from common/ and itself.',
    },
    {
      name: 'common',
      pattern: 'src/common/**',
      allowImportsFrom: ['src/common/**'],
      errorMessage: 'common/ can only import from itself.',
    },
    {
      name: 'core',
      pattern: 'src/core/**',
      allowImportsFrom: ['src/common/**', 'src/core/**'],
      errorMessage: 'core/ can only import from common/ and itself.',
    },
    {
      name: 'domain',
      pattern: 'src/*/domain/**',
      allowImportsFrom: ['src/*/domain/**'],
      errorMessage: 'domain/ can only import from domain/.',
    },
    {
      name: 'use-case',
      pattern: 'src/*/application/use-cases/*.use-case.ts',
      allowImportsFrom: [
        'src/*/application/dtos/**',
        'src/*/application/ports/**',
        'src/*/domain/**',
      ],
      errorMessage:
        'use-cases/ cannot import from other use-cases. Extract shared schemas/types to application/dtos/.',
    },
    {
      name: 'use-case-spec',
      pattern: 'src/*/application/use-cases/*.use-case.spec.ts',
      allowImportsFrom: [
        '{family_2}/test/**',
        '{family_3}/**',
        'src/*/domain/**',
      ],
      errorMessage:
        'use-case spec files can only import from domain/, ports/, dtos/ and use-cases/.',
    },
    {
      name: 'application',
      pattern: 'src/*/application/**',
      allowImportsFrom: ['src/*/domain/**', 'src/*/application/**'],
      errorMessage:
        'application/ can only import from domain/ and application/.',
    },
    {
      name: 'infrastructure',
      pattern: 'src/*/infrastructure/**',
      allowImportsFrom: [
        'packages/**',
        'src/*/domain/**',
        'src/*/application/**',
        'src/*/infrastructure/**',
      ],
      errorMessage:
        'infrastructure/ can only import from domain/, application/ and infrastructure/.',
    },
    {
      name: 'presentation',
      pattern: 'src/*/presentation/**',
      allowImportsFrom: [
        'src/*/presentation/**',
        'src/*/domain/**',
        'src/*/application/**',
      ],
      errorMessage:
        'presentation/ can only import from domain/, application/ and presentation/.',
    },
    {
      name: 'feature root',
      pattern: 'src/*/*',
      allowImportsFrom: ['{family_2}/**'],
      errorMessage:
        'feature root modules can only import from within their own feature.',
    },
    {
      name: 'main.ts',
      pattern: 'src/main.ts',
      allowImportsFrom: ['src/**'],
      errorMessage: 'main.ts can import from anywhere in src/.',
    },
  ],
});
