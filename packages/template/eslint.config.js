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

const featurePublicApiMessage =
  'App can consume features only through their public API: @features/*/api or @features/*/api/composition.'
const featureToAppMessage = 'Features cannot depend on @app/*.'
const featureCrossImportMessage =
  'Features cannot import other features internals. Cross-feature usage must go through @features/*/api.'
const sharedIndependenceMessage = 'Shared must stay independent from app and features.'

const restrictedImportPatterns = (...patterns) => [
  'error',
  {
    patterns,
  },
]

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    '**/*.md',
    '**/*.json',
    '.storybook',
    'playwright.config.ts',
    '**/*.stories.tsx',
    '**/*.stories.ts',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/tests/**', 'playwright.config.ts'],
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
      'import/no-relative-packages': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns(
        {
          regex: '^@features/[^/]+$',
          message: featurePublicApiMessage,
        },
        {
          regex: '^@features/[^/]+/(?!api(?:$|/composition$)).+',
          message: featurePublicApiMessage,
        },
        {
          regex: '^(?:\\.\\./)+features/[^/]+$',
          message: featurePublicApiMessage,
        },
        {
          regex: '^(?:\\.\\./)+features/[^/]+/(?!api(?:$|/composition$)).+',
          message: featurePublicApiMessage,
        },
      ),
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns(
        {
          regex: '^@app(?:/.*)?$',
          message: sharedIndependenceMessage,
        },
        {
          regex: '^@features(?:/.*)?$',
          message: sharedIndependenceMessage,
        },
        {
          regex: '^(?:\\.\\./)+app(?:/.*)?$',
          message: sharedIndependenceMessage,
        },
        {
          regex: '^(?:\\.\\./)+features(?:/.*)?$',
          message: sharedIndependenceMessage,
        },
      ),
    },
  },
  {
    files: ['src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns(
        {
          regex: '^@app(?:/.*)?$',
          message: featureToAppMessage,
        },
        {
          regex: '^(?:\\.\\./)+app(?:/.*)?$',
          message: featureToAppMessage,
        },
        {
          regex: '^@features/(?!auth(?:/|$))[^/]+$',
          message: featureCrossImportMessage,
        },
        {
          regex: '^@features/(?!auth(?:/|$))[^/]+/(?!api$).+',
          message: featureCrossImportMessage,
        },
        {
          regex:
            '^(?:\\.\\./)+(?!api(?:/|$)|application(?:/|$)|adapters(?:/|$)|composition(?:/|$)|domain(?:/|$)|infra(?:/|$)|ui(?:/|$))[^/]+$',
          message: featureCrossImportMessage,
        },
        {
          regex:
            '^(?:\\.\\./)+(?!api(?:/|$)|application(?:/|$)|adapters(?:/|$)|composition(?:/|$)|domain(?:/|$)|infra(?:/|$)|ui(?:/|$))[^/]+/(?!api$).+',
          message: featureCrossImportMessage,
        },
      ),
    },
  },
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns({
        group: [
          '**/features/*/infra/**',
          '@features/*/infra/**',
          '**/features/*/application/**',
          '@features/*/application/**',
          '**/features/*/adapters/**',
          '@features/*/adapters/**',
          '**/features/*/ui/**',
          '@features/*/ui/**',
          '@features/*/api',
          '**/features/*/api/**',
          '@features/*/api/**',
        ],
        message:
          'Domain layer cannot import application, adapters, UI, infra, or feature public APIs. Domain must stay pure.',
      }),
    },
  },
  {
    files: ['src/features/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns({
        group: [
          '**/features/*/infra/**',
          '@features/*/infra/**',
          '**/features/*/adapters/**',
          '@features/*/adapters/**',
          '**/features/*/ui/**',
          '@features/*/ui/**',
          '@features/*/api',
          '**/features/*/api/**',
          '@features/*/api/**',
        ],
        message:
          'Application layer can only depend on domain and ports. Use dependency inversion for infra and expose APIs outward only.',
      }),
    },
  },
  {
    files: ['src/features/*/adapters/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns(
        {
          group: ['**/features/*/infra/**', '@features/*/infra/**'],
          message: 'Adapters cannot import infra directly; receive dependencies via DI.',
        },
        {
          group: ['**/features/*/ui/**', '@features/*/ui/**'],
          message: 'Adapters cannot import UI components; let UI depend on adapters.',
        },
        {
          group: ['@features/*/api', '**/features/*/api/**', '@features/*/api/**'],
          message: 'Adapters cannot depend on the public API barrel of their own feature.',
        },
      ),
    },
  },
  {
    files: ['src/features/*/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImportPatterns(
        {
          group: ['**/features/*/infra/**', '@features/*/infra/**'],
          message: 'UI cannot import infra; depend on adapters.',
        },
        {
          group: ['**/features/*/application/**', '@features/*/application/**'],
          message: 'UI cannot import application layer directly; depend on adapters.',
        },
        {
          group: ['@features/*/api', '**/features/*/api/**', '@features/*/api/**'],
          message: 'UI cannot depend on the public API barrel of its own feature.',
        },
      ),
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
  storybook.configs['flat/recommended'],
])
