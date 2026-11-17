#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { accessSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE_MANAGERS = {
  npm: {
    install: ["install"],
    run: ["run"],
  },
  pnpm: {
    install: ["install"],
    run: [],
  },
  yarn: {
    install: ["install"],
    run: [],
  },
  bun: {
    install: ["install"],
    run: ["run"],
  },
};

const GENERATED_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

// `full` is the template as-is; the others apply a variant from ../variants.
const TEMPLATES = {
  full: "Todo example app with sign-in, pages, features and entities.",
  minimal: "Sign-in flow and an empty home page, without the todo example.",
  blank: "An empty home page with no sign-in and no example data.",
};

const EXCLUDED_ENTRIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "dist-ssr",
  "coverage",
  "playwright-report",
  "test-results",
  "storybook-static",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lockb",
  ".atl",
]);

function parseArgs(argv) {
  const options = {
    projectName: undefined,
    template: undefined,
    packageManager: undefined,
    install: false,
    force: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--install") {
      options.install = true;
      continue;
    }

    if (arg === "--no-install") {
      options.install = false;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--template" || arg === "-t") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`Missing value for --template. Use ${Object.keys(TEMPLATES).join(", ")}.`);
      }
      options.template = parseTemplate(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--template=")) {
      options.template = parseTemplate(arg.slice("--template=".length));
      continue;
    }

    if (arg === "--pm") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --pm. Use npm, pnpm, yarn, or bun.");
      }
      options.packageManager = parsePackageManager(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--pm=")) {
      options.packageManager = parsePackageManager(arg.slice("--pm=".length));
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (options.projectName) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    options.projectName = arg;
  }

  return options;
}

function parseTemplate(value) {
  if (Object.hasOwn(TEMPLATES, value)) {
    return value;
  }

  throw new Error(`Unknown template: ${value}. Use ${Object.keys(TEMPLATES).join(", ")}.`);
}

function parsePackageManager(value) {
  if (Object.hasOwn(PACKAGE_MANAGERS, value)) {
    return value;
  }

  throw new Error(`Unsupported package manager: ${value}. Use npm, pnpm, yarn, or bun.`);
}

function detectPackageManager(userAgent = process.env.npm_config_user_agent ?? "") {
  const [name] = userAgent.split("/");

  if (Object.hasOwn(PACKAGE_MANAGERS, name)) {
    return name;
  }

  return "npm";
}

function validateProjectName(projectName) {
  if (!projectName) {
    throw new Error(
      "Missing project name. Example: npm create @nastmz/react-starter@latest my-app",
    );
  }

  if (!GENERATED_NAME_PATTERN.test(projectName)) {
    throw new Error(
      "Invalid project name. Use lowercase letters, numbers, dots, hyphens, or underscores.",
    );
  }
}

async function assertDestination(destination, { force }) {
  if (!existsSync(destination)) {
    return;
  }

  const entries = await readdir(destination);
  if (entries.length === 0 || force) {
    return;
  }

  throw new Error(`Destination already exists and is not empty: ${destination}`);
}

function getTemplateCandidates(cliDirectory) {
  return [
    path.resolve(cliDirectory, "..", "template"),
    path.resolve(cliDirectory, "..", "..", "template"),
  ];
}

function resolveTemplateDirectory(cliDirectory = path.dirname(fileURLToPath(import.meta.url))) {
  for (const candidate of getTemplateCandidates(cliDirectory)) {
    try {
      accessSync(path.join(candidate, "package.json"), constants.R_OK);
      return candidate;
    } catch {
      // Try the next known layout.
    }
  }

  throw new Error("Cannot find the bundled React Starter template.");
}

function resolveVariantsDirectory(cliDirectory = path.dirname(fileURLToPath(import.meta.url))) {
  return path.resolve(cliDirectory, "..", "variants");
}

async function loadVariantChain(variantsDirectory, name) {
  const chain = [];
  let current = name;

  while (current) {
    if (chain.some((variant) => variant.name === current)) {
      throw new Error(`Circular variant inheritance at "${current}".`);
    }

    const directory = path.join(variantsDirectory, current);
    const manifest = JSON.parse(await readFile(path.join(directory, "variant.json"), "utf8"));
    chain.unshift({ name: current, directory, manifest });
    current = manifest.extends;
  }

  return chain;
}

/**
 * Turns the full template into a smaller one: each variant in the chain (base
 * first) removes paths, then overlays its own files on top.
 */
async function applyVariant({ destination, template, variantsDirectory }) {
  if (template === "full") {
    return;
  }

  for (const { directory, manifest } of await loadVariantChain(variantsDirectory, template)) {
    for (const relativePath of manifest.remove ?? []) {
      const target = path.resolve(destination, relativePath);

      if (!target.startsWith(destination + path.sep)) {
        throw new Error(`Variant path escapes the project: ${relativePath}`);
      }

      await rm(target, { recursive: true, force: true });
      await removeEmptyParents(path.dirname(target), destination);
    }

    const filesDirectory = path.join(directory, "files");
    if (existsSync(filesDirectory)) {
      await cp(filesDirectory, destination, { recursive: true, force: true });
    }
  }
}

/** Deletes directories left empty by a removal, stopping at the project root. */
async function removeEmptyParents(directory, destination) {
  let current = directory;

  while (current.startsWith(destination + path.sep) && existsSync(current)) {
    if ((await readdir(current)).length > 0) {
      return;
    }

    await rm(current, { recursive: true });
    current = path.dirname(current);
  }
}

async function copyTemplate({ templateDirectory, destination, projectName }) {
  await mkdir(destination, { recursive: true });

  await cp(templateDirectory, destination, {
    recursive: true,
    filter: (source) => !shouldExclude(source, templateDirectory),
  });

  await restoreDotfiles(destination);
  await renderPackageJson(path.join(destination, "package.json"), projectName);
}

// Files the template cannot ship under their real name:
// - npm never publishes `.gitignore`, so the bundled template ships `_gitignore`.
// - a real `pnpm-workspace.yaml` inside the template would turn it into a nested
//   workspace in this repository, so the project's pnpm settings ship renamed.
const DOTFILE_RENAMES = [
  ["_gitignore", ".gitignore"],
  ["_pnpm-workspace.yaml", "pnpm-workspace.yaml"],
];

async function restoreDotfiles(destination) {
  for (const [bundledName, finalName] of DOTFILE_RENAMES) {
    const bundledPath = path.join(destination, bundledName);

    if (existsSync(bundledPath) && !existsSync(path.join(destination, finalName))) {
      await rename(bundledPath, path.join(destination, finalName));
    }
  }
}

function shouldExclude(source, templateDirectory) {
  const relativePath = path.relative(templateDirectory, source);

  if (!relativePath) {
    return false;
  }

  return relativePath.split(path.sep).some((entry) => EXCLUDED_ENTRIES.has(entry));
}

async function renderPackageJson(packageJsonPath, projectName) {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  packageJson.name = projectName;
  packageJson.private = true;

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function formatCommand(packageManager, command) {
  const adapter = PACKAGE_MANAGERS[packageManager];
  const parts = [packageManager, ...adapter.run, command];
  return parts.join(" ");
}

function getInstallCommand(packageManager) {
  const adapter = PACKAGE_MANAGERS[packageManager];
  return [packageManager, ...adapter.install].join(" ");
}

async function runInstall(destination, packageManager) {
  const adapter = PACKAGE_MANAGERS[packageManager];

  await new Promise((resolve, reject) => {
    const child = spawn(packageManager, adapter.install, {
      cwd: destination,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${getInstallCommand(packageManager)} failed with exit code ${code}.`));
    });
  });
}

async function createProject(rawOptions, environment = {}) {
  const options = {
    ...rawOptions,
    packageManager: rawOptions.packageManager ?? detectPackageManager(environment.userAgent),
    template: rawOptions.template ?? "full",
  };

  validateProjectName(options.projectName);

  const cwd = environment.cwd ?? process.cwd();
  const destination = path.resolve(cwd, options.projectName);
  const templateDirectory = environment.templateDirectory ?? resolveTemplateDirectory();

  await assertDestination(destination, { force: options.force });
  await copyTemplate({ templateDirectory, destination, projectName: options.projectName });
  await applyVariant({
    destination,
    template: options.template,
    variantsDirectory: environment.variantsDirectory ?? resolveVariantsDirectory(),
  });

  if (options.install) {
    await runInstall(destination, options.packageManager);
  }

  return {
    destination,
    packageManager: options.packageManager,
    template: options.template,
    nextSteps: getNextSteps(options.projectName, options.packageManager, options.install),
  };
}

function getNextSteps(projectName, packageManager, installed) {
  const steps = [`cd ${projectName}`];

  if (!installed) {
    steps.push(getInstallCommand(packageManager));
  }

  steps.push(formatCommand(packageManager, "dev"));
  return steps;
}

function printHelp() {
  const templates = Object.entries(TEMPLATES)
    .map(([name, description]) => `  ${name.padEnd(8)} ${description}`)
    .join("\n");

  console.log(`create-react-starter

Usage:
  npm create @nastmz/react-starter@latest my-app
  pnpm create @nastmz/react-starter my-app
  yarn create @nastmz/react-starter my-app
  bun create @nastmz/react-starter my-app

Templates (--template, default: full):
${templates}

Options:
  -t, --template <name>     Starting point: full, minimal or blank
  --pm <npm|pnpm|yarn|bun>  Override package manager detection
  --install                 Install dependencies after scaffolding
  --no-install              Skip dependency installation (default)
  --force                   Allow writing into an existing directory
  -h, --help                Show this help
`);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
      return;
    }

    const result = await createProject(options, {
      userAgent: process.env.npm_config_user_agent,
    });

    console.log(
      `\nCreated ${path.basename(result.destination)} from the "${result.template}" template.`,
    );
    console.log("\nNext steps:");
    for (const step of result.nextSteps) {
      console.log(`  ${step}`);
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exitCode = 1;
  }
}

const isEntrypoint = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isEntrypoint) {
  await main();
}

export {
  applyVariant,
  copyTemplate,
  createProject,
  detectPackageManager,
  formatCommand,
  getInstallCommand,
  getNextSteps,
  parseArgs,
  resolveTemplateDirectory,
  validateProjectName,
};
