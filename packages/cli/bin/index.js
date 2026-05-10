#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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
    throw new Error("Missing project name. Example: npm create @nastmz/clean-react@latest my-app");
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

  throw new Error("Cannot find the bundled React Clean Architecture template.");
}

async function copyTemplate({ templateDirectory, destination, projectName }) {
  await mkdir(destination, { recursive: true });

  await cp(templateDirectory, destination, {
    recursive: true,
    filter: (source) => !shouldExclude(source, templateDirectory),
  });

  await renderPackageJson(path.join(destination, "package.json"), projectName);
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
  };

  validateProjectName(options.projectName);

  const cwd = environment.cwd ?? process.cwd();
  const destination = path.resolve(cwd, options.projectName);
  const templateDirectory = environment.templateDirectory ?? resolveTemplateDirectory();

  await assertDestination(destination, { force: options.force });
  await copyTemplate({ templateDirectory, destination, projectName: options.projectName });

  if (options.install) {
    await runInstall(destination, options.packageManager);
  }

  return {
    destination,
    packageManager: options.packageManager,
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
  console.log(`create-clean-react

Usage:
  npm create @nastmz/clean-react@latest my-app
  pnpm create @nastmz/clean-react my-app
  yarn create @nastmz/clean-react my-app
  bun create @nastmz/clean-react my-app

Options:
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

    console.log(`\nCreated ${path.basename(result.destination)} with React Clean Architecture.`);
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
