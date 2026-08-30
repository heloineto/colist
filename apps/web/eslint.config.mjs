import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = defineConfig([
  globalIgnores([
    'dist/**',
    'dev-dist/**',
    'node_modules/**',
    'public/**',
    'reports/**',
    'src/app/route-tree.gen.ts',
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslintReact.configs['strict-type-checked']],
  },
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
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
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'Use @/ path alias instead of relative imports.',
            },
          ],
          paths: [
            {
              name: '@mantine/core',
              importNames: [
                'Stack',
                'Box',
                'Flex',
                'SimpleGrid',
                'Text',
                'Title',
              ],
              message:
                'Use native html elements with Tailwind CSS classes instead.',
            },
            {
              name: 'react',
              importNames: [
                'ComponentPropsWithoutRef',
                'ComponentPropsWithRef',
              ],
              allowTypeImports: false,
              message:
                'Ref is just a prop in React >=19. Use ComponentProps instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/index.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: resolve(__dirname, 'src/app/styles.css'),
      },
    },
    rules: {
      'better-tailwindcss/enforce-canonical-classes': 'error',
      'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      'better-tailwindcss/enforce-consistent-important-position': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-unknown-classes': [
        'error',
        { ignore: ['mantine-focus-auto'] },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
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
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
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
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
          allowNumber: true,
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
]);

export default eslintConfig;
