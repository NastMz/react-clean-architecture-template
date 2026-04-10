import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const featurePublicApiMessage =
  'App can consume every feature folder only through its public API: @features/*/api or @features/*/api/composition.'
const featureToAppMessage = 'Features cannot depend on @app/*.'
const featureCrossImportMessage =
  'Features cannot import other features internals. Cross-feature usage must go through @features/*/api.'
const sharedIndependenceMessage = 'Shared must stay independent from app and features.'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const featuresDirectory = path.join(currentDirectory, 'src', 'features')
const featureNames = readdirSync(featuresDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const restrictedImportPatterns = (...patterns) => [
  'error',
  {
    patterns,
  },
]

const createFeatureBoundaryPatterns = (featureName) => [
  {
    regex: '^@app(?:/.*)?$',
    message: featureToAppMessage,
  },
  {
    regex: '^(?:\\.\\./)+app(?:/.*)?$',
    message: featureToAppMessage,
  },
  {
    regex: `^@features/(?!${featureName}(?:/|$))[^/]+$`,
    message: featureCrossImportMessage,
  },
  {
    regex: `^@features/(?!${featureName}(?:/|$))[^/]+/(?!api(?:$|/composition$)).+`,
    message: featureCrossImportMessage,
  },
  {
    regex:
      '^(?:\\.\\./)+(?!(?:api|application|adapters|composition|domain|infra|ui)(?:/|$))(?!\\.{1,2}(?:/|$))[^/]+$',
    message: featureCrossImportMessage,
  },
  {
    regex:
      '^(?:\\.\\./)+(?!(?:api|application|adapters|composition|domain|infra|ui)(?:/|$))(?!\\.{1,2}(?:/|$))[^/]+/(?!api(?:$|/composition$)).+',
    message: featureCrossImportMessage,
  },
]

const createFeatureBoundaryConfig = (featureName) => ({
  files: [`src/features/${featureName}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': restrictedImportPatterns(
      ...createFeatureBoundaryPatterns(featureName),
    ),
  },
})

const createFeatureLayerConfig = (featureName, layer, patterns) => ({
  files: [`src/features/${featureName}/${layer}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': restrictedImportPatterns(
      ...createFeatureBoundaryPatterns(featureName),
      ...patterns,
    ),
  },
})

const domainLayerPatterns = [
  {
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
  },
]

const applicationLayerPatterns = [
  {
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
  },
]

const adaptersLayerPatterns = [
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
]

const uiLayerPatterns = [
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
]

const featureBoundaryConfigs = featureNames.flatMap((featureName) => [
  createFeatureBoundaryConfig(featureName),
  createFeatureLayerConfig(featureName, 'domain', domainLayerPatterns),
  createFeatureLayerConfig(featureName, 'application', applicationLayerPatterns),
  createFeatureLayerConfig(featureName, 'adapters', adaptersLayerPatterns),
  createFeatureLayerConfig(featureName, 'ui', uiLayerPatterns),
])

const typedProjectConfig = {
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
}

const typedTestsConfig = {
  ...typedProjectConfig,
  rules: {
    ...typedProjectConfig.rules,
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'simple-import-sort/imports': 'off',
  },
}

const playwrightTestsConfig = {
  ...typedTestsConfig,
  extends: [...typedProjectConfig.extends, playwright.configs['flat/recommended']],
}

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
    ...typedProjectConfig,
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    ignores: ['tests/e2e/**'],
    ...typedTestsConfig,
  },
  {
    files: ['tests/e2e/**/*.{ts,tsx}'],
    ...playwrightTestsConfig,
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      // App code stays on the canonical feature contract: either the UI-facing
      // `@features/*/api` barrel or the wiring-facing `@features/*/api/composition`
      // seam. No direct imports from feature internals.
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
  ...featureBoundaryConfigs,
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
