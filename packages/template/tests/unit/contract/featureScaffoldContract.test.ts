import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(currentDirectory, '../../..')

const readTemplateFile = (relativePath: string): string =>
  readFileSync(path.join(templateRoot, relativePath), 'utf8')

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

    expect(playbook).toContain('api/composition.ts exists only when app composition or tests need wiring exports')
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
      'createHttpAuthRepository',
      'createInMemoryAuthRepository',
    ])
  })

  it('keeps products UI exports on api and wiring exports on api/composition', async () => {
    const productsApi = await import('@features/products/api')
    const productsComposition = await import('@features/products/api/composition')

    expect(Object.keys(productsApi).sort()).toEqual(['ProductsPage', 'useCreateProduct', 'useProducts'])
    expect(Object.keys(productsComposition).sort()).toEqual([
      'ProductAdaptersProvider',
      'createInMemoryProductRepository',
      'createProductAdapters',
      'createProductUseCases',
    ])
  })
})
