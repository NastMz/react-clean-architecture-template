import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(currentDirectory, '../../..')
const workspaceRoot = path.resolve(templateRoot, '..', '..')

interface PackageJson {
  scripts?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface TsConfig {
  compilerOptions?: {
    ignoreDeprecations?: string
  }
  include?: string[]
}

const readTemplateFile = (relativePath: string): string =>
  readFileSync(path.join(templateRoot, relativePath), 'utf8')

const readWorkspaceFile = (relativePath: string): string =>
  readFileSync(path.join(workspaceRoot, relativePath), 'utf8')

const parseJsonc = <T>(rawContent: string): T => {
  const withoutBlockComments = rawContent.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const withoutLineComments = withoutBlockComments.replaceAll(/(^|\s)\/\/.*$/gm, '$1')
  return JSON.parse(withoutLineComments) as T
}

const readTemplatePackageJson = (): PackageJson =>
  parseJsonc<PackageJson>(readTemplateFile('package.json'))

const readTemplateDevDependencies = (): Record<string, string> =>
  readTemplatePackageJson().devDependencies ?? {}

const readWorkspaceLockfile = (): string => readWorkspaceFile('pnpm-lock.yaml')

const readTsConfig = (relativePath: string): TsConfig =>
  parseJsonc<TsConfig>(readTemplateFile(relativePath))

const readMajorMinor = (range: string): string => {
  const match = /(\d+)\.(\d+)\./.exec(range)

  if (!match) {
    throw new Error(`Cannot parse semver range: ${range}`)
  }

  const [, major, minor] = match
  return `${major}.${minor}`
}

describe('tooling contract', () => {
  it('keeps the documented command entrypoints in package scripts', () => {
    const scripts = readTemplatePackageJson().scripts ?? {}

    expect(scripts).toHaveProperty('test')
    expect(scripts).toHaveProperty('test:watch')
    expect(scripts).toHaveProperty('storybook')
    expect(scripts).toHaveProperty('build-storybook')
  })

  it('keeps command entrypoints semantically aligned with test and storybook runners', () => {
    const scripts = readTemplatePackageJson().scripts ?? {}

    expect(scripts.test).toContain('vitest')
    expect(scripts['test:watch']).toContain('vitest')
    expect(scripts.storybook).toContain('storybook')
    expect(scripts['build-storybook']).toContain('storybook')
  })

  it('keeps test config references aligned with actual config files', () => {
    const tsconfigTestIncludes = readTsConfig('tsconfig.test.json').include ?? []
    const tsconfigNodeIncludes = readTsConfig('tsconfig.node.json').include ?? []

    expect(tsconfigTestIncludes).toContain('vitest.config.ts')
    expect(tsconfigNodeIncludes).toEqual(
      expect.arrayContaining(['vite.config.ts', 'vitest.config.ts']),
    )
    expect(() => readTemplateFile('vitest.config.ts')).not.toThrow()
  })

  it('avoids stale test-config references after config normalization', () => {
    const tsconfigTestIncludes = readTsConfig('tsconfig.test.json').include ?? []
    const tsconfigNodeIncludes = readTsConfig('tsconfig.node.json').include ?? []

    expect(tsconfigTestIncludes).not.toContain('vitest.workspace.ts')
    expect(tsconfigNodeIncludes).not.toContain('vitest.workspace.ts')
  })

  it('documents the Stage A gate checks without Storybook execution', () => {
    const stageAGate = readWorkspaceFile('sdd/build-test-toolchain-upgrade/stage-a-gate.md')

    expect(stageAGate).toContain('pnpm lint')
    expect(stageAGate).toContain('pnpm typecheck')
    expect(stageAGate).toContain('pnpm test')
    expect(stageAGate).not.toContain('pnpm storybook')
    expect(stageAGate).not.toContain('pnpm build-storybook')
  })

  it('keeps Storybook ecosystem aligned to the Stage B baseline', () => {
    const devDependencies = readTemplateDevDependencies()

    const storybookFamily = [
      'storybook',
      '@storybook/react-vite',
      '@storybook/addon-a11y',
      '@storybook/addon-docs',
      '@storybook/addon-onboarding',
      '@storybook/addon-vitest',
      'eslint-plugin-storybook',
    ] as const

    for (const packageName of storybookFamily) {
      const versionRange = devDependencies[packageName]

      expect(versionRange).toBeDefined()
      expect(readMajorMinor(versionRange ?? '')).toBe('10.3')
    }

    expect(readMajorMinor(devDependencies['@chromatic-com/storybook'] ?? '')).toBe('5.1')
  })

  it('tracks the Stage A TypeScript and typed lint baselines', () => {
    const devDependencies = readTemplateDevDependencies()
    const eslintConfig = readTemplateFile('eslint.config.js')

    expect(readMajorMinor(devDependencies.typescript ?? '')).toBe('6.0')
    expect(readMajorMinor(devDependencies['typescript-eslint'] ?? '')).toBe('8.59')
    expect(eslintConfig).toContain('projectService: true')
    expect(eslintConfig).toContain('recommendedTypeChecked')
    expect(eslintConfig).toContain('stylisticTypeChecked')
  })

  it('pins the Stage B ESLint 9 defer baseline while import plugin peers exclude ESLint 10', () => {
    const devDependencies = readTemplateDevDependencies()
    const lockfile = readWorkspaceLockfile()

    expect(devDependencies.eslint).toBe('~9.39.2')
    expect(devDependencies['@eslint/js']).toBe('~9.39.2')
    expect(devDependencies['eslint-config-prettier']).toBe('^9.1.0')
    expect(lockfile).toContain('eslint-plugin-import@2.32.0')
    expect(lockfile).toContain('eslint: ^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9')
    expect(lockfile).toMatch(/eslint@9\.39\.\d+/)
  })

  it('keeps TS6 project references explicit about accepted compiler deprecations', () => {
    const appConfig = readTemplateFile('tsconfig.app.json')
    const testConfig = readTemplateFile('tsconfig.test.json')

    expect(appConfig).toContain('"ignoreDeprecations": "6.0"')
    expect(testConfig).toContain('"ignoreDeprecations": "6.0"')
  })

  it('keeps public docs free of internal migration framing', () => {
    const publicDocs = ['README.md', 'QUICKSTART.md', 'docs/testing-strategy.md'] as const

    for (const relativePath of publicDocs) {
      const content = readTemplateFile(relativePath)

      expect(content).not.toContain('Stage A')
      expect(content).not.toContain('Stage B')
      expect(content).not.toContain('internal migration')
    }
  })

  it('documents the upgraded runtime baseline and command locations', () => {
    const readme = readTemplateFile('README.md')
    const quickstart = readTemplateFile('QUICKSTART.md')
    const testingStrategy = readTemplateFile('docs/testing-strategy.md')

    expect(readme).toContain('>=20.19.0')
    expect(quickstart).toContain('>=20.19.0')
    expect(testingStrategy).toContain('vitest.config.ts')
    expect(readme).toContain('npm, pnpm, yarn, or bun')
    expect(quickstart).toContain('npm create clean-react@latest my-app')
  })

  it('avoids monorepo-only command forms in consumer-facing docs', () => {
    const publicDocs = ['README.md', 'QUICKSTART.md', 'docs/testing-strategy.md'] as const

    for (const relativePath of publicDocs) {
      const content = readTemplateFile(relativePath)

      expect(content).not.toContain('pnpm -C packages/template')
    }
  })
})
