import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HELP_TEXT = `Usage: pnpm scaffold:feature -- --name <feature-key> --label <Label> --route </route> [options]

Options:
  --name <feature-key>     Required kebab-case key (for example: billing)
  --label <label>          Required display label (for example: Billing)
  --route <route>          Required route path (for example: /billing)
  --default                Marks the feature entry route as default
  --composition            Generates composition/ folder + api/composition.ts
  --dry-run                Prints deterministic plan and exits without writing
  --skip-registry          Writes files but skips registry patch; prints manual snippet
  --help                   Prints this help output
`

const REQUIRED_FEATURE_FOLDERS = ['adapters', 'api', 'application', 'domain', 'infra', 'ui']
const OPTIONAL_FEATURE_FOLDERS = ['composition']

const toPosixPath = (value) => value.replaceAll('\\', '/')

const isValidFeatureKey = (value) => /^[a-z]+(?:-[a-z0-9]+)*$/.test(value)

export const normalizeFeatureKey = (rawFeatureKey) => {
  const normalized = rawFeatureKey.trim()

  if (!isValidFeatureKey(normalized)) {
    throw new Error('Feature name must be lowercase kebab-case')
  }

  return normalized
}

const toPascalCase = (featureKey) =>
  featureKey
    .split('-')
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('')

const toCamelCase = (featureKey) => {
  const pascal = toPascalCase(featureKey)
  return pascal[0].toLowerCase() + pascal.slice(1)
}

const normalizeRoutePath = (rawRoutePath) => {
  const routePath = rawRoutePath.trim()

  if (!routePath.startsWith('/')) {
    throw new Error('Route must start with "/"')
  }

  if (routePath === '/') {
    throw new Error('Route "/" is reserved for app landing redirection')
  }

  return routePath
}

const getFlagValue = ({ argv, index, flag }) => {
  const value = argv[index + 1]

  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`)
  }

  return value
}

export const parseScaffoldArgs = (argv) => {
  const options = {
    showHelp: false,
    featureKey: '',
    featureLabel: '',
    routePath: '',
    isDefaultRoute: false,
    includeComposition: false,
    dryRun: false,
    skipRegistry: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--help') {
      options.showHelp = true
      continue
    }

    if (token === '--name') {
      options.featureKey = normalizeFeatureKey(getFlagValue({ argv, index, flag: '--name' }))
      index += 1
      continue
    }

    if (token === '--label') {
      options.featureLabel = getFlagValue({ argv, index, flag: '--label' }).trim()
      index += 1
      continue
    }

    if (token === '--route') {
      options.routePath = normalizeRoutePath(getFlagValue({ argv, index, flag: '--route' }))
      index += 1
      continue
    }

    if (token === '--default') {
      options.isDefaultRoute = true
      continue
    }

    if (token === '--composition') {
      options.includeComposition = true
      continue
    }

    if (token === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (token === '--skip-registry') {
      options.skipRegistry = true
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  if (options.showHelp) {
    return options
  }

  if (!options.featureKey) {
    throw new Error('Missing required --name')
  }

  if (!options.featureLabel) {
    throw new Error('Missing required --label')
  }

  if (!options.routePath) {
    throw new Error('Missing required --route')
  }

  return options
}

const getScaffoldNames = (featureKey) => {
  const pascalName = toPascalCase(featureKey)
  const camelName = toCamelCase(featureKey)

  return {
    featureKey,
    pascalName,
    camelName,
    pageName: `${pascalName}Page`,
    adaptersFactoryName: `create${pascalName}Adapters`,
    adaptersTypeName: `${pascalName}Adapters`,
    useCasesFactoryName: `create${pascalName}UseCases`,
    repositoryFactoryName: `createInMemory${pascalName}Repository`,
    providerName: `${pascalName}AdaptersProvider`,
    adaptersFileName: `${camelName}Adapters.ts`,
    useCasesFileName: `${camelName}UseCases.ts`,
    domainFileName: `${pascalName}.ts`,
    repositoryFileName: `inMemory${pascalName}Repository.ts`,
    providerFileName: `${pascalName}AdaptersProvider.tsx`,
  }
}

export const buildScaffoldPlan = ({
  featureKey,
  featureLabel,
  routePath,
  isDefaultRoute,
  includeComposition,
  skipRegistry,
}) => {
  const names = getScaffoldNames(featureKey)
  const featureRoot = `src/features/${featureKey}`

  const folders = [...REQUIRED_FEATURE_FOLDERS]
  if (includeComposition) {
    folders.push(...OPTIONAL_FEATURE_FOLDERS)
  }

  const plannedFolders = folders.map((folder) => `${featureRoot}/${folder}`).sort()
  const plannedFiles = [
    `${featureRoot}/adapters/${names.adaptersFileName}`,
    `${featureRoot}/api/index.ts`,
    `${featureRoot}/application/${names.useCasesFileName}`,
    `${featureRoot}/domain/${names.domainFileName}`,
    `${featureRoot}/infra/${names.repositoryFileName}`,
    `${featureRoot}/ui/${names.pageName}.tsx`,
    'src/app/extensions/' + `${featureKey}.tsx`,
  ]

  if (includeComposition) {
    plannedFiles.push(`${featureRoot}/api/composition.ts`)
    plannedFiles.push(`${featureRoot}/composition/${names.providerFileName}`)
  }

  return {
    options: { featureKey, featureLabel, routePath, isDefaultRoute, includeComposition, skipRegistry },
    folders: plannedFolders,
    files: plannedFiles.sort(),
  }
}

const readExistingDefaultFeatureKey = (cwd) => {
  const extensionsRoot = path.join(cwd, 'src', 'app', 'extensions')

  if (!existsSync(extensionsRoot)) {
    return null
  }

  const extensionFiles = readdirSync(extensionsRoot)
    .filter((entry) => entry.endsWith('.tsx'))
    .filter((entry) => entry !== 'registry.tsx')

  for (const extensionFile of extensionFiles) {
    const absoluteFilePath = path.join(extensionsRoot, extensionFile)
    const content = readFileSync(absoluteFilePath, 'utf8')

    if (content.includes('isDefault: true')) {
      return extensionFile.replace('.tsx', '')
    }
  }

  return null
}

const ensureNoPathConflicts = ({ cwd, featureKey, plan }) => {
  const featureRoot = `src/features/${featureKey}`
  const featureRootPath = path.join(cwd, featureRoot)

  if (existsSync(featureRootPath)) {
    throw new Error(`Feature folder already exists: ${featureRoot}`)
  }

  const extensionPath = path.join(cwd, 'src', 'app', 'extensions', `${featureKey}.tsx`)
  if (existsSync(extensionPath)) {
    throw new Error(`Extension file already exists: src/app/extensions/${featureKey}.tsx`)
  }

  const collisions = [...plan.folders, ...plan.files].filter((relativePath) =>
    existsSync(path.join(cwd, relativePath)),
  )

  if (collisions.length > 0) {
    throw new Error(`Target path already exists: ${toPosixPath(collisions[0])}`)
  }
}

const REGISTRY_IMPORT_ANCHOR_END = '// @scaffold-feature-imports:end'
const REGISTRY_ENTRY_ANCHOR_END = '// @scaffold-feature-entries:end'

const assertRegistryAnchors = (registryContent) => {
  if (
    !registryContent.includes(REGISTRY_IMPORT_ANCHOR_END) ||
    !registryContent.includes(REGISTRY_ENTRY_ANCHOR_END)
  ) {
    throw new Error('Registry patch anchors are missing in src/app/extensions/registry.tsx')
  }
}

const hasRegistryKey = ({ registryContent, featureKey }) => {
  const entryRegex = new RegExp(`\\n\\s*${featureKey}\\s*:`, 'm')
  return entryRegex.test(registryContent)
}

export const patchRegistryContent = ({ registryContent, featureKey, featureSymbol }) => {
  assertRegistryAnchors(registryContent)

  const importLine = `import { ${featureSymbol} } from './${featureKey}'`
  const entryLine = `  ${featureKey}: ${featureSymbol},`

  if (registryContent.includes(importLine) || hasRegistryKey({ registryContent, featureKey })) {
    throw new Error(`Registry key already exists: ${featureKey}`)
  }

  const withImport = registryContent.replace(
    REGISTRY_IMPORT_ANCHOR_END,
    `${importLine}\n${REGISTRY_IMPORT_ANCHOR_END}`,
  )

  return withImport.replace(REGISTRY_ENTRY_ANCHOR_END, `${entryLine}\n  ${REGISTRY_ENTRY_ANCHOR_END}`)
}

const makeUiApiContent = ({ names }) =>
  `// UI-facing public API. App/router code should stop here.\nexport { ${names.pageName} } from '../ui/${names.pageName}'\n`

const makeCompositionApiContent = ({ names }) =>
  `// Wiring-facing public API for extension manifests, composition root, and tests.\nexport type { ${names.adaptersTypeName} } from '../adapters/${names.adaptersFileName.replace('.ts', '')}'\nexport { ${names.adaptersFactoryName} } from '../adapters/${names.adaptersFileName.replace('.ts', '')}'\nexport { ${names.useCasesFactoryName} } from '../application/${names.useCasesFileName.replace('.ts', '')}'\nexport { ${names.providerName} } from '../composition/${names.providerFileName.replace('.tsx', '')}'\nexport { ${names.repositoryFactoryName} } from '../infra/${names.repositoryFileName.replace('.ts', '')}'\n`

const makePageContent = ({ names, featureLabel }) =>
  `import { Card, CardHeader } from '@shared/ui/atoms/Card'\nimport { Eyebrow, Muted } from '@shared/ui/atoms/Typography'\n\nexport const ${names.pageName} = () => (\n  <Card>\n    <CardHeader>\n      <div>\n        <Eyebrow>${featureLabel} feature</Eyebrow>\n        <h2>${featureLabel}</h2>\n        <Muted>Replace this placeholder page with your use-case UI flow.</Muted>\n      </div>\n    </CardHeader>\n  </Card>\n)\n`

const makeAdaptersContent = ({ names, featureKey }) =>
  `export interface ${names.adaptersTypeName} {\n  featureKey: '${featureKey}'\n}\n\nexport const ${names.adaptersFactoryName} = (): ${names.adaptersTypeName} => ({\n  featureKey: '${featureKey}',\n})\n`

const makeUseCasesContent = ({ names }) =>
  `export interface ${names.pascalName}UseCases {\n  placeholder(): Promise<void>\n}\n\nexport const ${names.useCasesFactoryName} = (): ${names.pascalName}UseCases => ({\n  async placeholder() {},\n})\n`

const makeDomainContent = ({ names, featureKey }) =>
  `export interface ${names.pascalName}Entity {\n  id: string\n}\n\nexport interface Create${names.pascalName}Input {\n  name: string\n}\n\nexport const ${names.camelName}FeatureKey = '${featureKey}'\n`

const makeRepositoryContent = ({ names }) =>
  `export interface ${names.pascalName}Repository {\n  placeholder(): Promise<void>\n}\n\nexport const ${names.repositoryFactoryName} = (): ${names.pascalName}Repository => ({\n  async placeholder() {},\n})\n`

const makeProviderContent = ({ names }) =>
  `import type { ReactNode } from 'react'\n\nimport type { ${names.adaptersTypeName} } from '../adapters/${names.adaptersFileName.replace('.ts', '')}'\n\nexport const ${names.providerName} = ({\n  children,\n}: {\n  adapters: ${names.adaptersTypeName}\n  children: ReactNode\n}): ReactNode => children\n`

const makeExtensionContent = ({ names, featureKey, routePath, featureLabel, includeComposition, isDefaultRoute }) => {
  const routeEntryLine = isDefaultRoute
    ? `  entryRoute: { to: '${routePath}', isDefault: true },`
    : `  entryRoute: { to: '${routePath}' },`

  if (includeComposition) {
    return [
      `import { ${names.pageName} } from '@features/${featureKey}/api'`,
      'import {',
      `  ${names.providerName},`,
      `  ${names.adaptersFactoryName},`,
      `  ${names.useCasesFactoryName},`,
      `  ${names.repositoryFactoryName},`,
      `} from '@features/${featureKey}/api/composition'`,
      '',
      "import { defineAppFeature } from './contracts'",
      '',
      `export const ${featureKey}Feature = defineAppFeature({`,
      '  createAdapters: () => {',
      `    const repository = ${names.repositoryFactoryName}()`,
      `    const useCases = ${names.useCasesFactoryName}(repository)`,
      `    return ${names.adaptersFactoryName}({ useCases })`,
      '  },',
      '  renderProvider: ({ adapters, children }) => (',
      `    <${names.providerName} adapters={adapters}>{children}</${names.providerName}>`,
      '  ),',
      `  routes: [{ path: '${routePath}', element: <${names.pageName} /> }],`,
      routeEntryLine,
      `  navigation: { label: '${featureLabel}', to: '${routePath}' },`,
      '})',
      '',
    ].join('\n')
  }

  return [
    `import { ${names.pageName} } from '@features/${featureKey}/api'`,
    '',
    "import { defineAppFeature } from './contracts'",
    '',
    `export const ${featureKey}Feature = defineAppFeature({`,
    `  createAdapters: () => ({ featureKey: '${featureKey}' }),`,
    `  routes: [{ path: '${routePath}', element: <${names.pageName} /> }],`,
    routeEntryLine,
    `  navigation: { label: '${featureLabel}', to: '${routePath}' },`,
    '})',
    '',
  ].join('\n')
}

const getGeneratedFiles = ({
  featureKey,
  featureLabel,
  routePath,
  isDefaultRoute,
  includeComposition,
}) => {
  const names = getScaffoldNames(featureKey)
  const featureRoot = `src/features/${featureKey}`

  const files = [
    {
      relativePath: `${featureRoot}/api/index.ts`,
      content: makeUiApiContent({ names }),
    },
    {
      relativePath: `${featureRoot}/adapters/${names.adaptersFileName}`,
      content: makeAdaptersContent({ names, featureKey }),
    },
    {
      relativePath: `${featureRoot}/application/${names.useCasesFileName}`,
      content: makeUseCasesContent({ names }),
    },
    {
      relativePath: `${featureRoot}/domain/${names.domainFileName}`,
      content: makeDomainContent({ names, featureKey }),
    },
    {
      relativePath: `${featureRoot}/infra/${names.repositoryFileName}`,
      content: makeRepositoryContent({ names }),
    },
    {
      relativePath: `${featureRoot}/ui/${names.pageName}.tsx`,
      content: makePageContent({ names, featureLabel }),
    },
    {
      relativePath: `src/app/extensions/${featureKey}.tsx`,
      content: makeExtensionContent({
        names,
        featureKey,
        routePath,
        featureLabel,
        includeComposition,
        isDefaultRoute,
      }),
    },
  ]

  if (includeComposition) {
    files.push({
      relativePath: `${featureRoot}/api/composition.ts`,
      content: makeCompositionApiContent({ names }),
    })
    files.push({
      relativePath: `${featureRoot}/composition/${names.providerFileName}`,
      content: makeProviderContent({ names }),
    })
  }

  return files
}

const toPlanLines = (plan) => [
  'Scaffold plan:',
  ...plan.folders.map((folder) => `  mkdir ${folder}`),
  ...plan.files.map((file) => `  write ${file}`),
]

const buildManualRegistrySnippet = ({ featureKey }) => {
  const featureSymbol = `${featureKey}Feature`

  return [
    'Manual registry patch (because --skip-registry was used):',
    `import { ${featureSymbol} } from './${featureKey}'`,
    `  ${featureKey}: ${featureSymbol},`,
  ]
}

const writeScaffoldFiles = ({ cwd, plan, files }) => {
  for (const folder of plan.folders) {
    mkdirSync(path.join(cwd, folder), { recursive: true })
  }

  for (const file of files) {
    writeFileSync(path.join(cwd, file.relativePath), file.content, 'utf8')
  }
}

const rollbackScaffoldFiles = ({ cwd, featureKey }) => {
  rmSync(path.join(cwd, 'src', 'features', featureKey), { recursive: true, force: true })
  rmSync(path.join(cwd, 'src', 'app', 'extensions', `${featureKey}.tsx`), {
    recursive: false,
    force: true,
  })
}

const runScaffoldInternal = async ({ cwd, argv }) => {
  const options = parseScaffoldArgs(argv)

  if (options.showHelp) {
    return {
      dryRun: true,
      planLines: [HELP_TEXT.trimEnd()],
      manualRegistrySnippet: [],
      wroteFiles: false,
    }
  }

  const plan = buildScaffoldPlan(options)
  const planLines = toPlanLines(plan)
  const featureSymbol = `${options.featureKey}Feature`

  ensureNoPathConflicts({
    cwd,
    featureKey: options.featureKey,
    plan,
  })

  if (options.isDefaultRoute) {
    const existingDefault = readExistingDefaultFeatureKey(cwd)
    if (existingDefault) {
      throw new Error(
        `Cannot mark ${options.featureKey} as default because ${existingDefault} already declares isDefault: true`,
      )
    }
  }

  const registryPath = path.join(cwd, 'src', 'app', 'extensions', 'registry.tsx')
  const registryContent = readFileSync(registryPath, 'utf8')
  const patchedRegistry = options.skipRegistry
    ? registryContent
    : patchRegistryContent({
        registryContent,
        featureKey: options.featureKey,
        featureSymbol,
      })

  const generatedFiles = getGeneratedFiles(options)

  if (options.dryRun) {
    return {
      dryRun: true,
      planLines,
      manualRegistrySnippet: options.skipRegistry
        ? buildManualRegistrySnippet({ featureKey: options.featureKey })
        : [],
      wroteFiles: false,
    }
  }

  try {
    writeScaffoldFiles({ cwd, plan, files: generatedFiles })

    if (!options.skipRegistry) {
      writeFileSync(registryPath, patchedRegistry, 'utf8')
    }
  } catch (error) {
    rollbackScaffoldFiles({ cwd, featureKey: options.featureKey })
    throw error
  }

  return {
    dryRun: false,
    planLines,
    manualRegistrySnippet: options.skipRegistry
      ? buildManualRegistrySnippet({ featureKey: options.featureKey })
      : [],
    wroteFiles: true,
  }
}

export const runScaffold = async ({ cwd = process.cwd(), argv = process.argv.slice(2) } = {}) =>
  runScaffoldInternal({ cwd, argv })

const main = async () => {
  try {
    const result = await runScaffold()

    for (const line of result.planLines) {
      console.log(line)
    }

    for (const line of result.manualRegistrySnippet) {
      console.log(line)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

const isMainModule = (() => {
  const invokedScriptPath = process.argv[1]

  if (!invokedScriptPath) {
    return false
  }

  return path.resolve(invokedScriptPath) === path.resolve(fileURLToPath(import.meta.url))
})()

if (isMainModule) {
  await main()
}
