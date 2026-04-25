import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(currentDirectory, '../../..')

const readTemplateFile = (relativePath: string): string =>
  readFileSync(path.join(templateRoot, relativePath), 'utf8')

const normalizeRelativePath = (relativePath: string): string => relativePath.replaceAll('\\', '/')

const listFilesRecursively = (relativePath: string): string[] => {
  const absolutePath = path.join(templateRoot, relativePath)
  const entries = readdirSync(absolutePath)
  const files: string[] = []

  for (const entry of entries) {
    const entryAbsolutePath = path.join(absolutePath, entry)
    const entryRelativePath = path.join(relativePath, entry)

    if (statSync(entryAbsolutePath).isDirectory()) {
      files.push(...listFilesRecursively(entryRelativePath))
      continue
    }

    files.push(entryRelativePath)
  }

  return files
}

const FEATURE_CONTAINER_ALLOWLIST = {
  AUTH_PAGE: 'src/features/auth/ui/AuthPage.tsx',
  AUTH_HOOKS: 'src/features/auth/ui/authHooks.tsx',
  TODO_HOOKS: 'src/features/todo/ui/todoHooks.tsx',
  TODO_PAGE: 'src/features/todo/ui/TodoPage.tsx',
} as const

type FeatureContainerAllowlistPath =
  (typeof FEATURE_CONTAINER_ALLOWLIST)[keyof typeof FEATURE_CONTAINER_ALLOWLIST]

const isContainerOrHookFile = (relativePath: string): relativePath is FeatureContainerAllowlistPath => {
  const normalizedPath = normalizeRelativePath(relativePath)
  return Object.values(FEATURE_CONTAINER_ALLOWLIST).includes(normalizedPath as FeatureContainerAllowlistPath)
}

const listFeatureUiPresentationalFiles = (): string[] => {
  const featureUiFiles = listFilesRecursively('src/features').filter(
    (relativePath) => /[\\/]ui[\\/]/.test(relativePath) && relativePath.endsWith('.tsx'),
  )

  return featureUiFiles.filter((relativePath) => !isContainerOrHookFile(relativePath))
}

const listFeatureUiFiles = (): string[] =>
  listFilesRecursively('src/features').filter(
    (relativePath) => /[\\/]ui[\\/]/.test(relativePath) && relativePath.endsWith('.tsx'),
  )

const extractFeatureNameFromUiPath = (relativePath: string): string | null => {
  const normalizedPath = normalizeRelativePath(relativePath)
  const featurePathMatch = /^src\/features\/([^/]+)\/ui\/.+\.tsx$/.exec(normalizedPath)

  return featurePathMatch?.[1] ?? null
}

const SHARED_UI_IMPORT_PATTERN = /from\s+['"]@shared\/ui\/([^'"]+)['"]/g

const collectSharedUiUsageByFeature = (): Map<string, string[]> => {
  const sharedUiUsage = new Map<string, Set<string>>()

  for (const relativePath of listFeatureUiFiles()) {
    const featureName = extractFeatureNameFromUiPath(relativePath)

    if (!featureName) {
      continue
    }

    const fileContent = readTemplateFile(relativePath)

    for (const sharedUiImportMatch of fileContent.matchAll(SHARED_UI_IMPORT_PATTERN)) {
      const [, sharedUiModulePath] = sharedUiImportMatch

      if (!sharedUiModulePath) {
        continue
      }

      if (!sharedUiUsage.has(sharedUiModulePath)) {
        sharedUiUsage.set(sharedUiModulePath, new Set<string>())
      }

      sharedUiUsage.get(sharedUiModulePath)?.add(featureName)
    }
  }

  const usageByFeatureList = new Map<string, string[]>()

  for (const [sharedUiModulePath, featureNames] of sharedUiUsage.entries()) {
    usageByFeatureList.set(sharedUiModulePath, [...featureNames].sort())
  }

  return usageByFeatureList
}

const FORBIDDEN_PRESENTATIONAL_IMPORT_PATTERNS = [
  /from\s+['"][^'"]*\/ui\/.*Hooks['"]/,
  /from\s+['"][^'"]*\/adapters\//,
  /from\s+['"][^'"]*\/application\//,
  /from\s+['"][^'"]*\/infra\//,
  /from\s+['"][^'"]*\/composition\//,
  /from\s+['"]@app\//,
] as const

describe('feature scaffold contract docs', () => {
  it('declares the canonical required and optional feature folders in the playbook', () => {
    const playbook = readTemplateFile('docs/feature-playbook.md')

    expect(playbook).toContain('required top-level folders')
    expect(playbook).toContain('api/')
    expect(playbook).toContain('adapters/')
    expect(playbook).toContain('application/')
    expect(playbook).toContain('domain/')
    expect(playbook).toContain('infra/')
    expect(playbook).toContain('ui/')
    expect(playbook).toContain('composition/ is optional')
  })

  it('explains when api/composition.ts exists', () => {
    const playbook = readTemplateFile('docs/feature-playbook.md')

    expect(playbook).toContain(
      'api/composition.ts exists only when app composition or tests need wiring exports',
    )
  })

  it('names src/app/extensions/<feature>.tsx plus registry.tsx as the single app integration seam', () => {
    const architecture = readTemplateFile('docs/architecture.md')

    expect(architecture).toContain('src/app/extensions/<feature>.tsx')
    expect(architecture).toContain('src/app/extensions/registry.tsx')
    expect(architecture).toContain('single app integration seam')
  })

  it('summarizes the contract in the README and warns that CLI work stays out of scope', () => {
    const readme = readTemplateFile('README.md')

    expect(readme).toContain('Canonical feature scaffold contract')
    expect(readme).toContain('CLI/generator work stays out of scope until this contract is closed')
  })

  it('keeps canonical docs aligned to auth + todo and blocks stale products references', () => {
    const canonicalDocs = [
      'README.md',
      'QUICKSTART.md',
      'KNOWN_ISSUES.md',
      'docs/architecture.md',
      'docs/feature-playbook.md',
      'docs/testing-strategy.md',
      'docs/maintainers/README.md',
    ] as const

    for (const relativePath of canonicalDocs) {
      const content = readTemplateFile(normalizeRelativePath(relativePath))

      expect(content).not.toContain('`products`')
      expect(content).not.toContain('/products')
      expect(content).not.toContain('@features/products')
    }
  })

  it('documents auth + todo as canonical quickstart runtime surface', () => {
    const quickstart = readTemplateFile('QUICKSTART.md')

    expect(quickstart).toContain('- `/` redirects to `/auth`')
    expect(quickstart).toContain('- canonical protected feature route is `/todo`')
    expect(quickstart).toContain('- the app shell navigation exposes `Auth` and `Todo`')
  })

  it('keeps an explicit maintainer-facing documentation location', () => {
    const readme = readTemplateFile('README.md')
    const maintainerNotes = readTemplateFile('docs/maintainers/README.md')

    expect(readme).toContain('Maintainer-facing docs')
    expect(maintainerNotes).toContain('This document is maintainer-facing.')
  })
})

describe('feature scaffold public APIs', () => {
  it('keeps auth UI exports on api and wiring exports on api/composition', async () => {
    const authApi = await import('@features/auth/api')
    const authComposition = await import('@features/auth/api/composition')

    expect(Object.keys(authApi).sort()).toEqual(['AuthPage', 'useLogin', 'useLogout', 'useSession'])
    expect(Object.keys(authComposition).sort()).toEqual([
      'AuthAdaptersProvider',
      'createAuthAdapters',
      'createAuthUseCases',
      'createInMemoryAuthRepository',
    ])
  })

  it('keeps todo UI exports on api and wiring exports on api/composition', async () => {
    const todoApi = await import('@features/todo/api')
    const todoComposition = await import('@features/todo/api/composition')

    expect(Object.keys(todoApi).sort()).toEqual(['TodoPage', 'useCreateTodo', 'useTodos'])
    expect(Object.keys(todoComposition).sort()).toEqual([
      'TodoAdaptersProvider',
      'createInMemoryTodoRepository',
      'createTodoAdapters',
      'createTodoUseCases',
    ])
  })
})

describe('ui thesis hardening contract', () => {
  it('requires demonstrated cross-feature reuse for canonical shared ui atoms', () => {
    const sharedUiUsageByFeature = collectSharedUiUsageByFeature()

    const promotedSharedAtoms = [
      'atoms/Button',
      'atoms/Card',
      'atoms/Input',
      'atoms/Layout',
      'atoms/Typography',
    ] as const

    for (const promotedSharedAtom of promotedSharedAtoms) {
      const featuresUsingAtom = sharedUiUsageByFeature.get(promotedSharedAtom)

      expect(featuresUsingAtom).toBeDefined()
      expect(featuresUsingAtom).toEqual(expect.arrayContaining(['auth', 'todo']))
      expect(featuresUsingAtom?.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('keeps feature-specific molecules out of shared ui', () => {
    const authPage = readTemplateFile('src/features/auth/ui/AuthPage.tsx')

    expect(authPage).not.toContain('@shared/ui/molecules/SessionCard')
    expect(() => readTemplateFile('src/shared/ui/molecules/SessionCard.tsx')).toThrow()
    expect(() => readTemplateFile('src/shared/ui/molecules/TodoList.tsx')).toThrow()
  })

  it('keeps Input aligned with React 19 ref-as-prop style', () => {
    const input = readTemplateFile('src/shared/ui/atoms/Input.tsx')

    expect(input).not.toContain('forwardRef')
  })

  it('removes React namespace types from canonical shared and router files', () => {
    const filesToCheck = [
      'src/shared/ui/atoms/Layout.tsx',
      'src/shared/ui/atoms/Typography.tsx',
      'src/app/router/ProtectedRoute.tsx',
      'tests/integration/auth/AuthPage.test.tsx',
    ] as const

    for (const relativePath of filesToCheck) {
      const content = readTemplateFile(relativePath)

      expect(content).not.toMatch(/\bReact\./)
    }
  })

  it('keeps presentational feature ui files free from orchestration imports', () => {
    const presentationalFiles = listFeatureUiPresentationalFiles()

    expect(presentationalFiles.length).toBeGreaterThan(0)

    for (const relativePath of presentationalFiles) {
      const content = readTemplateFile(relativePath)

      for (const forbiddenPattern of FORBIDDEN_PRESENTATIONAL_IMPORT_PATTERNS) {
        expect(content).not.toMatch(forbiddenPattern)
      }
    }
  })

  it('keeps an explicit container/hook allowlist for canonical feature ui orchestration', () => {
    const allowlistValues = Object.values(FEATURE_CONTAINER_ALLOWLIST)

    expect(allowlistValues).toContain('src/features/auth/ui/AuthPage.tsx')
    expect(allowlistValues).toContain('src/features/todo/ui/TodoPage.tsx')
    expect(allowlistValues).toContain('src/features/auth/ui/authHooks.tsx')
    expect(allowlistValues).toContain('src/features/todo/ui/todoHooks.tsx')
  })

  it('documents container-orchestrates and presentational-renders ownership in architecture docs', () => {
    const architecture = readTemplateFile('docs/architecture.md')

    expect(architecture).toContain('container orchestrates')
    expect(architecture).toContain('presentational components render')
    expect(architecture).toContain('presentational components must not import hooks, adapters, use cases, or repositories')
  })

  it('documents shared-ui promotion rule based on demonstrated reuse', () => {
    const playbook = readTemplateFile('docs/feature-playbook.md')

    expect(playbook).toContain('promote to shared UI only after demonstrated reuse in at least 2 features')
    expect(playbook).toContain('avoid speculative shared abstractions')
  })

  it('aligns testing strategy with boundary and thesis enforcement language', () => {
    const testingStrategy = readTemplateFile('docs/testing-strategy.md')

    expect(testingStrategy).toContain('contract tests enforce container vs presentational boundaries')
    expect(testingStrategy).toContain('integration tests verify auth and todo composition still behaves correctly')
  })
})
