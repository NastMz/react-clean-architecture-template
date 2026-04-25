const normalizePath = (file) => file.replaceAll('\\', '/')

const quote = (file) => `"${file}"`

const toTemplateRelative = (file) => normalizePath(file).replace(/^packages\/template\//, '')

const templateTypeScriptCommandSet = (files) => {
  const templateFiles = files.map(normalizePath).filter((file) => file.startsWith('packages/template/'))

  if (templateFiles.length === 0) {
    return []
  }

  const relativeFiles = templateFiles.map(toTemplateRelative).map(quote).join(' ')

  return [
    `pnpm -C packages/template exec prettier --write ${relativeFiles}`,
    `pnpm -C packages/template exec eslint --fix --no-warn-ignored ${relativeFiles}`,
  ]
}

const templatePrettierCommand = (files) => {
  const templateFiles = files.map(normalizePath).filter((file) => file.startsWith('packages/template/'))

  if (templateFiles.length === 0) {
    return []
  }

  const relativeFiles = templateFiles.map(toTemplateRelative).map(quote).join(' ')

  return [`pnpm -C packages/template exec prettier --write ${relativeFiles}`]
}

export default {
  'packages/template/**/*.{ts,tsx}': templateTypeScriptCommandSet,
  'packages/template/**/*.{js,jsx,json,css,md,yml,yaml}': templatePrettierCommand,
}
