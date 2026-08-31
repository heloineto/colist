import { dirname } from 'path';
import { fileURLToPath } from 'url';
import stylistic from '@stylistic/eslint-plugin';
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginZod from 'eslint-plugin-zod';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {
  projectStructureParser,
  projectStructurePlugin,
} from 'eslint-plugin-project-structure';
import {
  folderStructureConfig,
  independentModulesConfig,
} from './project-structure.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = defineConfig(
  {
    files: ['**'],
    ignores: ['projectStructure.cache.json'],
    languageOptions: { parser: projectStructureParser },
    plugins: { 'project-structure': projectStructurePlugin },
    rules: {
      'project-structure/folder-structure': ['error', folderStructureConfig],
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
  })),
  eslintConfigPrettier,
  globalIgnores([
    'dist/**',
    'node_modules/**',
    '*.config.mjs',
    'project-structure.mjs',
    'coverage/**',
    'reports/**',
  ]),
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        allowDefaultProject: true,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      curly: ['error', 'multi-line'],
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'prefer-template': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/config',
              message: "Import from '@/common/infrastructure/config' instead.",
            },
            {
              name: '@nestjs/common',
              importNames: ['Logger', 'LoggerService', 'ConsoleLogger'],
              message:
                "Import Logger from '@/common/application/ports/logger.port' instead.",
            },
          ],
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'Use @/ path alias instead of relative imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.{ts,tsx,js,mjs,cjs}'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['src/common/infrastructure/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: true,
        },
      ],
      'max-depth': ['error', 3],
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true, allowStaticOnly: true },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowAny: true,
          allowNullableBoolean: true,
          allowNullableEnum: true,
          allowNullableNumber: false,
          allowNullableObject: true,
          allowNullableString: true,
          allowNumber: true,
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
          allowString: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  eslintPluginZod.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      'zod/prefer-string-schema-with-trim': 'off',
      'zod/consistent-import': ['error', { syntax: 'named' }],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    plugins: { 'project-structure': projectStructurePlugin },
    rules: {
      'project-structure/independent-modules': [
        'error',
        independentModulesConfig,
      ],
    },
  }
);

export default eslintConfig;
