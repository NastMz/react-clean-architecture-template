import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

const templateRoot = path.resolve(import.meta.dirname, '../../..')
const scaffoldScriptPath = path.join(templateRoot, 'scripts/scaffold-feature.mjs')

interface BuildScaffoldPlanInput {
  featureKey: string
  featureLabel: string
  routePath: string
  isDefaultRoute: boolean
  includeComposition: boolean
  skipRegistry: boolean
}

interface ScaffoldPlan {
  folders: string[]
  files: string[]
}

interface RunScaffoldResult {
  dryRun: boolean
  planLines: string[]
}

interface ScaffoldModule {
  normalizeFeatureKey: (featureKey: string) => string
  buildScaffoldPlan: (input: BuildScaffoldPlanInput) => ScaffoldPlan
  runScaffold: (input: { cwd: string; argv: string[] }) => Promise<RunScaffoldResult>
}

const loadScaffoldModule = async (): Promise<ScaffoldModule> => {
  const moduleExports: unknown = await import(
    `${pathToFileURL(scaffoldScriptPath).href}?cacheBust=${Date.now()}`
  )

  return moduleExports as ScaffoldModule
}

const seedTemplateFixture = (root: string) => {
  mkdirSync(path.join(root, 'src', 'app', 'extensions'), { recursive: true })
  mkdirSync(path.join(root, 'src', 'features', 'auth'), { recursive: true })
  mkdirSync(path.join(root, 'src', 'features', 'todo'), { recursive: true })

  writeFileSync(
    path.join(root, 'src', 'app', 'extensions', 'auth.tsx'),
    [
      "import { defineAppFeature } from './contracts'",
      '',
      'export const authFeature = defineAppFeature({',
      '  createAdapters: () => ({}),',
      "  routes: [{ path: '/auth', element: <div /> }],",
      "  entryRoute: { to: '/auth', isDefault: true },",
      "  navigation: { label: 'Auth', to: '/auth' },",
      '})',
      '',
    ].join('\n'),
    'utf8',
  )

  writeFileSync(
    path.join(root, 'src', 'app', 'extensions', 'todo.tsx'),
    [
      "import { defineAppFeature } from './contracts'",
      '',
      'export const todoFeature = defineAppFeature({',
      '  createAdapters: () => ({}),',
      "  routes: [{ path: '/todo', element: <div /> }],",
      "  entryRoute: { to: '/todo' },",
      "  navigation: { label: 'Todo', to: '/todo' },",
      '})',
      '',
    ].join('\n'),
    'utf8',
  )

  writeFileSync(
    path.join(root, 'src', 'app', 'extensions', 'registry.tsx'),
    [
      "import { authFeature } from './auth'",
      "import { todoFeature } from './todo'",
      '// @scaffold-feature-imports:end',
      '',
      'export const appFeatureRegistry = {',
      '  auth: authFeature,',
      '  todo: todoFeature,',
      '  // @scaffold-feature-entries:end',
      '} as const',
      '',
    ].join('\n'),
    'utf8',
  )
}

describe('scaffold-feature tooling', () => {
  it('rejects non-kebab feature keys and normalizes valid keys', async () => {
    const module = await loadScaffoldModule()

    expect(() => module.normalizeFeatureKey('Billing')).toThrowError(
      'Feature name must be lowercase kebab-case',
    )
    expect(() => module.normalizeFeatureKey('billing_feature')).toThrowError(
      'Feature name must be lowercase kebab-case',
    )
    expect(module.normalizeFeatureKey('billing-payments')).toBe('billing-payments')
  })

  it('builds a deterministic plan with required folders and canonical files', async () => {
    const module = await loadScaffoldModule()

    const plan = module.buildScaffoldPlan({
      featureKey: 'billing',
      featureLabel: 'Billing',
      routePath: '/billing',
      isDefaultRoute: false,
      includeComposition: true,
      skipRegistry: false,
    })

    expect(plan.folders).toEqual([
      'src/features/billing/adapters',
      'src/features/billing/api',
      'src/features/billing/application',
      'src/features/billing/composition',
      'src/features/billing/domain',
      'src/features/billing/infra',
      'src/features/billing/ui',
    ])
    expect(plan.files).toContain('src/features/billing/api/index.ts')
    expect(plan.files).toContain('src/features/billing/api/composition.ts')
    expect(plan.files).toContain('src/features/billing/ui/BillingPage.tsx')
    expect(plan.files).toContain('src/app/extensions/billing.tsx')
  })

  it('fails before writing when target feature paths already exist', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-feature-'))

    try {
      seedTemplateFixture(fixtureRoot)
      mkdirSync(path.join(fixtureRoot, 'src', 'features', 'billing'), { recursive: true })

      await expect(
        module.runScaffold({
          cwd: fixtureRoot,
          argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing'],
        }),
      ).rejects.toThrowError('Feature folder already exists: src/features/billing')
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('supports dry-run and keeps filesystem unchanged', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-feature-'))

    try {
      seedTemplateFixture(fixtureRoot)
      const registryPath = path.join(fixtureRoot, 'src', 'app', 'extensions', 'registry.tsx')
      const beforeRegistry = readFileSync(registryPath, 'utf8')

      const output = await module.runScaffold({
        cwd: fixtureRoot,
        argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing', '--dry-run'],
      })

      expect(output.dryRun).toBe(true)
      expect(
        output.planLines.some((line) => line.includes('src/features/billing/api/index.ts')),
      ).toBe(true)
      expect(() =>
        readFileSync(path.join(fixtureRoot, 'src', 'features', 'billing'), 'utf8'),
      ).toThrow()
      expect(readFileSync(registryPath, 'utf8')).toBe(beforeRegistry)
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('rejects duplicate registry keys and duplicate default intent', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-feature-'))

    try {
      seedTemplateFixture(fixtureRoot)

      const registryPath = path.join(fixtureRoot, 'src', 'app', 'extensions', 'registry.tsx')
      writeFileSync(
        registryPath,
        [
          "import { authFeature } from './auth'",
          "import { todoFeature } from './todo'",
          "import { billingFeature } from './billing'",
          '// @scaffold-feature-imports:end',
          '',
          'export const appFeatureRegistry = {',
          '  auth: authFeature,',
          '  todo: todoFeature,',
          '  billing: billingFeature,',
          '  // @scaffold-feature-entries:end',
          '} as const',
          '',
        ].join('\n'),
        'utf8',
      )

      await expect(
        module.runScaffold({
          cwd: fixtureRoot,
          argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing'],
        }),
      ).rejects.toThrowError('Registry key already exists: billing')

      await expect(
        module.runScaffold({
          cwd: fixtureRoot,
          argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing', '--default'],
        }),
      ).rejects.toThrowError(
        'Cannot mark billing as default because auth already declares isDefault: true',
      )
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('fails fast when registry anchors are missing', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-feature-'))

    try {
      seedTemplateFixture(fixtureRoot)
      writeFileSync(
        path.join(fixtureRoot, 'src', 'app', 'extensions', 'registry.tsx'),
        'export const appFeatureRegistry = {} as const\n',
        'utf8',
      )

      await expect(
        module.runScaffold({
          cwd: fixtureRoot,
          argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing'],
        }),
      ).rejects.toThrowError(
        'Registry patch anchors are missing in src/app/extensions/registry.tsx',
      )
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })
})
