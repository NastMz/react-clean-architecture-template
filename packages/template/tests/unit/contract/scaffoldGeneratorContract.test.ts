import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

const templateRoot = path.resolve(import.meta.dirname, '../../..')
const scaffoldScriptPath = path.join(templateRoot, 'scripts/scaffold-feature.mjs')

interface RunScaffoldResult {
  dryRun: boolean
  planLines: string[]
}

interface ScaffoldModule {
  runScaffold: (input: { cwd: string; argv: string[] }) => Promise<RunScaffoldResult>
}

const loadScaffoldModule = async (): Promise<ScaffoldModule> => {
  const moduleExports: unknown = await import(
    `${pathToFileURL(scaffoldScriptPath).href}?cacheBust=${Date.now()}`
  )

  return moduleExports as ScaffoldModule
}

const seedFixture = (root: string) => {
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

describe('scaffold generator contract', () => {
  it('generates required folders and omits optional composition by default', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-contract-'))

    try {
      seedFixture(fixtureRoot)

      await module.runScaffold({
        cwd: fixtureRoot,
        argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing'],
      })

      const generatedFolders = readdirSync(
        path.join(fixtureRoot, 'src', 'features', 'billing'),
      ).sort()

      expect(generatedFolders).toEqual(['adapters', 'api', 'application', 'domain', 'infra', 'ui'])
      expect(generatedFolders).not.toContain('composition')
      expect(() =>
        readFileSync(path.join(fixtureRoot, 'src', 'features', 'billing', 'api', 'composition.ts')),
      ).toThrow()
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('generates composition-only API when composition flag is enabled', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-contract-'))

    try {
      seedFixture(fixtureRoot)

      await module.runScaffold({
        cwd: fixtureRoot,
        argv: [
          '--name',
          'billing',
          '--label',
          'Billing',
          '--route',
          '/billing',
          '--composition',
          '--skip-registry',
        ],
      })

      const compositionApi = readFileSync(
        path.join(fixtureRoot, 'src', 'features', 'billing', 'api', 'composition.ts'),
        'utf8',
      )
      const uiApi = readFileSync(
        path.join(fixtureRoot, 'src', 'features', 'billing', 'api', 'index.ts'),
        'utf8',
      )

      expect(uiApi).toContain("export { BillingPage } from '../ui/BillingPage'")
      expect(uiApi).not.toContain('createBillingAdapters')
      expect(compositionApi).toContain('createBillingAdapters')
      expect(compositionApi).toContain('createBillingUseCases')
      expect(compositionApi).toContain('createInMemoryBillingRepository')
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('writes extension manifest metadata and registers feature via registry seam only', async () => {
    const module = await loadScaffoldModule()
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'scaffold-contract-'))

    try {
      seedFixture(fixtureRoot)

      await module.runScaffold({
        cwd: fixtureRoot,
        argv: ['--name', 'billing', '--label', 'Billing', '--route', '/billing'],
      })

      const extension = readFileSync(
        path.join(fixtureRoot, 'src', 'app', 'extensions', 'billing.tsx'),
        'utf8',
      )
      const registry = readFileSync(
        path.join(fixtureRoot, 'src', 'app', 'extensions', 'registry.tsx'),
        'utf8',
      )
      const appRootFiles = readdirSync(path.join(fixtureRoot, 'src', 'app'))

      expect(extension).toContain('defineAppFeature')
      expect(extension).toContain("routes: [{ path: '/billing', element: <BillingPage /> }]")
      expect(extension).toContain("entryRoute: { to: '/billing' }")
      expect(extension).toContain("navigation: { label: 'Billing', to: '/billing' }")
      expect(registry).toContain("import { billingFeature } from './billing'")
      expect(registry).toContain('billing: billingFeature,')
      expect(appRootFiles).not.toContain('providers.tsx')
      expect(appRootFiles).not.toContain('routes.tsx')
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  })
})
