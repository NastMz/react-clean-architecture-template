// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    '**/*.md',
    '**/*.json',
    '.storybook',
    'src/stories',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/tests/**', 'src/app/composition/container.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      'import/no-unresolved': 'off',
      'import/order': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/infra/**', '@features/*/infra/**'],
              message: 'UI and application layers cannot import infra directly.',
            },
            {
              group: ['**/features/*/ui/**'],
              message: 'Lower layers cannot import UI.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/infra/**', '@features/*/infra/**'],
              message: 'UI cannot import infra; depend on adapters.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/infra/**', '@features/*/infra/**', '**/features/*/ui/**'],
              message: 'Application layer cannot depend on infra or UI.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/features/*/application/**',
                '**/features/*/infra/**',
                '**/features/*/ui/**',
              ],
              message: 'Domain must stay pure and not import outer layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
