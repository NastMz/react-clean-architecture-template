#!/usr/bin/env node
/**
 * Scaffolds a Feature-Sliced Design slice with its public API.
 *
 *   pnpm slice pages settings
 *   pnpm slice features add-comment
 *   pnpm slice entities comment --segments model,api,ui
 *
 * The generated code is a starting point: wire pages into src/app/routes and
 * run `pnpm lint:fsd` to check the result.
 */
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const LAYERS = ['pages', 'widgets', 'features', 'entities']

export const SEGMENTS = ['ui', 'model', 'api', 'lib', 'config']

const DEFAULT_SEGMENTS = {
  pages: ['ui'],
  widgets: ['ui'],
  features: ['ui', 'model'],
  entities: ['model', 'api'],
}

const SLICE_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

const toPascalCase = (name) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

const toCamelCase = (name) => {
  const pascal = toPascalCase(name)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

const toTitle = (name) =>
  name
    .split('-')
    .join(' ')
    .replace(/^\w/, (char) => char.toUpperCase())

/** Builds the files of a slice as `{ relativePath: content }` without touching disk. */
export const renderSlice = ({ layer, name, segments }) => {
  const pascal = toPascalCase(name)
  const camel = toCamelCase(name)
  const component = layer === 'pages' ? `${pascal}Page` : pascal
  const files = {}
  const exports = []

  if (segments.includes('ui')) {
    files[`ui/${component}.tsx`] = `export function ${component}() {
  return (
    <section>
      <h1>${toTitle(name)}</h1>
    </section>
  )
}
`
    exports.push(`export { ${component} } from './ui/${component}'`)
  }

  if (segments.includes('model')) {
    files[`model/${camel}.ts`] = `export interface ${pascal} {
  id: string
}
`
    exports.push(`export type { ${pascal} } from './model/${camel}'`)
  }

  if (segments.includes('api')) {
    files[`api/${camel}Queries.ts`] = `export const ${camel}Queries = {
  all: () => ['${name}'] as const,
}
`
    exports.push(`export { ${camel}Queries } from './api/${camel}Queries'`)
  }

  for (const segment of segments.filter((item) => !['ui', 'model', 'api'].includes(item))) {
    files[`${segment}/.gitkeep`] = ''
  }

  files['index.ts'] = exports.length
    ? `${exports.sort().join('\n')}\n`
    : '// Public API: export only what other slices may use.\nexport {}\n'

  return files
}

const parseSegments = (value, layer) => {
  if (!value) {
    return DEFAULT_SEGMENTS[layer]
  }

  const segments = value.split(',').map((segment) => segment.trim())
  const unknown = segments.filter((segment) => !SEGMENTS.includes(segment))

  if (unknown.length > 0) {
    throw new Error(`Unknown segment(s): ${unknown.join(', ')}. Use: ${SEGMENTS.join(', ')}.`)
  }

  return segments
}

export const parseArgs = (argv) => {
  const [layer, name, ...rest] = argv

  if (!LAYERS.includes(layer)) {
    throw new Error(`Unknown layer "${layer ?? ''}". Use one of: ${LAYERS.join(', ')}.`)
  }

  if (!name || !SLICE_NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid slice name "${name ?? ''}". Use kebab-case, for example "add-comment".`,
    )
  }

  let segmentsArg
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]

    if (arg === '--segments') {
      segmentsArg = rest[index + 1]
      index += 1
    } else if (arg.startsWith('--segments=')) {
      segmentsArg = arg.slice('--segments='.length)
    } else {
      throw new Error(`Unknown option: ${arg}`)
    }
  }

  return { layer, name, segments: parseSegments(segmentsArg, layer) }
}

/** Writes the slice under `<srcDir>/<layer>/<name>`. Refuses to overwrite an existing slice. */
export const createSlice = async ({ srcDir, layer, name, segments }) => {
  const sliceDir = path.join(srcDir, layer, name)

  if (existsSync(sliceDir)) {
    throw new Error(`Slice already exists: ${path.relative(process.cwd(), sliceDir)}`)
  }

  const files = renderSlice({ layer, name, segments })

  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(sliceDir, relativePath)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, content)
  }

  return { sliceDir, files: Object.keys(files) }
}

const main = async () => {
  try {
    const options = parseArgs(process.argv.slice(2))
    const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
    const { sliceDir, files } = await createSlice({ srcDir, ...options })

    console.log(`Created ${path.relative(process.cwd(), sliceDir)}:`)
    for (const file of files) {
      console.log(`  ${file}`)
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.error(
      'Usage: pnpm slice <pages|widgets|features|entities> <name> [--segments ui,model,api]',
    )
    process.exitCode = 1
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main()
}
