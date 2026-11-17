import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createSlice, parseArgs, renderSlice } from './create-slice.mjs'

describe('parseArgs', () => {
  it('uses the default segments of each layer', () => {
    expect(parseArgs(['pages', 'settings'])).toEqual({
      layer: 'pages',
      name: 'settings',
      segments: ['ui'],
    })
    expect(parseArgs(['entities', 'comment']).segments).toEqual(['model', 'api'])
  })

  it('accepts explicit segments in both flag forms', () => {
    expect(parseArgs(['features', 'add-comment', '--segments', 'ui,api']).segments).toEqual([
      'ui',
      'api',
    ])
    expect(parseArgs(['features', 'add-comment', '--segments=model']).segments).toEqual(['model'])
  })

  it.each([
    [['shared', 'button'], 'Unknown layer "shared"'],
    [['pages', 'Settings'], 'Invalid slice name "Settings"'],
    [['pages'], 'Invalid slice name ""'],
    [['pages', 'settings', '--segments', 'hooks'], 'Unknown segment(s): hooks'],
    [['pages', 'settings', '--force'], 'Unknown option: --force'],
  ])('rejects %j', (argv, message) => {
    expect(() => parseArgs(argv)).toThrow(message)
  })
})

describe('renderSlice', () => {
  it('names page components with a Page suffix and exports them', () => {
    const files = renderSlice({ layer: 'pages', name: 'user-settings', segments: ['ui'] })

    expect(Object.keys(files)).toEqual(['ui/UserSettingsPage.tsx', 'index.ts'])
    expect(files['index.ts']).toBe("export { UserSettingsPage } from './ui/UserSettingsPage'\n")
  })

  it('creates model and api segments for entities', () => {
    const files = renderSlice({ layer: 'entities', name: 'comment', segments: ['model', 'api'] })

    expect(files['model/comment.ts']).toContain('export interface Comment')
    expect(files['api/commentQueries.ts']).toContain("all: () => ['comment'] as const")
    expect(files['index.ts']).toBe(
      "export type { Comment } from './model/comment'\nexport { commentQueries } from './api/commentQueries'\n",
    )
  })
})

describe('createSlice', () => {
  let srcDir

  beforeEach(async () => {
    srcDir = await mkdtemp(path.join(os.tmpdir(), 'create-slice-'))
  })

  afterEach(async () => {
    await rm(srcDir, { recursive: true, force: true })
  })

  it('writes the slice files to disk', async () => {
    await createSlice({ srcDir, layer: 'features', name: 'add-comment', segments: ['ui', 'model'] })

    const index = await readFile(path.join(srcDir, 'features', 'add-comment', 'index.ts'), 'utf8')
    expect(index).toContain("export { AddComment } from './ui/AddComment'")
    expect(existsSync(path.join(srcDir, 'features', 'add-comment', 'model', 'addComment.ts'))).toBe(
      true,
    )
  })

  it('refuses to overwrite an existing slice', async () => {
    await createSlice({ srcDir, layer: 'pages', name: 'settings', segments: ['ui'] })

    await expect(
      createSlice({ srcDir, layer: 'pages', name: 'settings', segments: ['ui'] }),
    ).rejects.toThrow('Slice already exists')
  })
})
