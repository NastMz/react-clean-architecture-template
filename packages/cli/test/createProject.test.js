import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  applyVariant,
  createProject,
  detectPackageManager,
  formatCommand,
  getInstallCommand,
  parseArgs,
  validateProjectName,
} from "../bin/index.js";

async function createFixtureTemplate() {
  const root = await mkdtemp(path.join(os.tmpdir(), "react-starter-template-"));

  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "react-starter", private: true }, null, 2),
  );
  await writeFile(path.join(root, "README.md"), "# Template\n");
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src", "main.tsx"), "console.log('template');\n");
  await mkdir(path.join(root, "node_modules"));
  await writeFile(path.join(root, "node_modules", "artifact.txt"), "do not copy\n");
  await mkdir(path.join(root, "playwright-report"));
  await writeFile(path.join(root, "playwright-report", "index.html"), "do not copy\n");
  await writeFile(path.join(root, "pnpm-lock.yaml"), "do not copy\n");

  return root;
}

test("detectPackageManager reads common create command user agents", () => {
  assert.equal(detectPackageManager("pnpm/10.33.0 npm/? node/v24 win32 x64"), "pnpm");
  assert.equal(detectPackageManager("yarn/1.22.22 npm/? node/v24 win32 x64"), "yarn");
  assert.equal(detectPackageManager("bun/1.3.0 npm/? node/v24 win32 x64"), "bun");
  assert.equal(detectPackageManager("npm/11.0.0 node/v24 win32 x64"), "npm");
  assert.equal(detectPackageManager(""), "npm");
});

test("package manager commands are adapter-specific", () => {
  assert.equal(getInstallCommand("npm"), "npm install");
  assert.equal(getInstallCommand("pnpm"), "pnpm install");
  assert.equal(getInstallCommand("yarn"), "yarn install");
  assert.equal(getInstallCommand("bun"), "bun install");

  assert.equal(formatCommand("npm", "dev"), "npm run dev");
  assert.equal(formatCommand("pnpm", "dev"), "pnpm dev");
  assert.equal(formatCommand("yarn", "dev"), "yarn dev");
  assert.equal(formatCommand("bun", "dev"), "bun run dev");
});

test("parseArgs supports scriptable package-manager agnostic usage", () => {
  assert.deepEqual(parseArgs(["my-app", "--pm", "bun", "--install"]), {
    projectName: "my-app",
    packageManager: "bun",
    template: undefined,
    install: true,
    force: false,
    help: false,
  });

  assert.deepEqual(parseArgs(["my-app", "--pm=pnpm", "--force"]), {
    projectName: "my-app",
    packageManager: "pnpm",
    template: undefined,
    install: false,
    force: true,
    help: false,
  });
});

test("validateProjectName rejects names that package managers cannot safely create", () => {
  assert.doesNotThrow(() => validateProjectName("my-app_1"));
  assert.throws(() => validateProjectName("My App"), /Invalid project name/);
  assert.throws(() => validateProjectName(""), /Missing project name/);
});

test("createProject copies the template, renders package.json, and omits local artifacts", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "react-starter-output-"));
  const templateDirectory = await createFixtureTemplate();

  try {
    const result = await createProject(
      { projectName: "my-app", install: false, force: false },
      { cwd, templateDirectory, userAgent: "yarn/1.22.22 npm/? node/v24" },
    );

    const destination = path.join(cwd, "my-app");
    const generatedPackageJson = JSON.parse(
      await readFile(path.join(destination, "package.json"), "utf8"),
    );

    assert.equal(result.destination, destination);
    assert.equal(result.packageManager, "yarn");
    assert.deepEqual(result.nextSteps, ["cd my-app", "yarn install", "yarn dev"]);
    assert.equal(generatedPackageJson.name, "my-app");
    assert.equal(generatedPackageJson.private, true);
    assert.equal(existsSync(path.join(destination, "src", "main.tsx")), true);
    assert.equal(existsSync(path.join(destination, "node_modules")), false);
    assert.equal(existsSync(path.join(destination, "playwright-report")), false);
    assert.equal(existsSync(path.join(destination, "pnpm-lock.yaml")), false);
  } finally {
    await rm(cwd, { recursive: true, force: true });
    await rm(templateDirectory, { recursive: true, force: true });
  }
});

test("createProject restores the .gitignore that npm cannot publish", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "react-starter-output-"));
  const templateDirectory = await createFixtureTemplate();
  await writeFile(path.join(templateDirectory, "_gitignore"), "node_modules\n");

  try {
    await createProject(
      { projectName: "my-app", install: false, force: false },
      { cwd, templateDirectory, userAgent: "pnpm/10.33.0 npm/? node/v24" },
    );

    const destination = path.join(cwd, "my-app");
    assert.equal(await readFile(path.join(destination, ".gitignore"), "utf8"), "node_modules\n");
    assert.equal(existsSync(path.join(destination, "_gitignore")), false);
  } finally {
    await rm(cwd, { recursive: true, force: true });
    await rm(templateDirectory, { recursive: true, force: true });
  }
});

test("parseArgs accepts the --template option in both forms", () => {
  assert.equal(parseArgs(["my-app", "--template", "minimal"]).template, "minimal");
  assert.equal(parseArgs(["my-app", "-t", "blank"]).template, "blank");
  assert.equal(parseArgs(["my-app", "--template=full"]).template, "full");
  assert.throws(() => parseArgs(["my-app", "--template", "huge"]), /Unknown template: huge/);
  assert.throws(() => parseArgs(["my-app", "--template"]), /Missing value for --template/);
});

async function createFixtureVariants() {
  const root = await mkdtemp(path.join(os.tmpdir(), "react-starter-variants-"));

  await mkdir(path.join(root, "small", "files", "src"), { recursive: true });
  await writeFile(
    path.join(root, "small", "variant.json"),
    JSON.stringify({ remove: ["src/example", "src/entities/todo", "README.md"] }),
  );
  await writeFile(path.join(root, "small", "files", "src", "main.tsx"), "small\n");
  await writeFile(path.join(root, "small", "files", "src", "home.tsx"), "home\n");

  await mkdir(path.join(root, "tiny", "files", "src"), { recursive: true });
  await writeFile(
    path.join(root, "tiny", "variant.json"),
    JSON.stringify({ extends: "small", remove: ["src/home.tsx"] }),
  );
  await writeFile(path.join(root, "tiny", "files", "src", "main.tsx"), "tiny\n");

  await mkdir(path.join(root, "escape"), { recursive: true });
  await writeFile(path.join(root, "escape", "variant.json"), JSON.stringify({ remove: ["../x"] }));

  return root;
}

async function createProjectDirectory() {
  const destination = await mkdtemp(path.join(os.tmpdir(), "react-starter-project-"));
  await mkdir(path.join(destination, "src", "example"), { recursive: true });
  await mkdir(path.join(destination, "src", "entities", "todo"), { recursive: true });
  await writeFile(path.join(destination, "src", "entities", "todo", "index.ts"), "export {};\n");
  await writeFile(path.join(destination, "src", "example", "page.tsx"), "example\n");
  await writeFile(path.join(destination, "src", "main.tsx"), "full\n");
  await writeFile(path.join(destination, "README.md"), "# App\n");
  return destination;
}

test("applyVariant removes paths and overlays files, base variants first", async () => {
  const variantsDirectory = await createFixtureVariants();
  const destination = await createProjectDirectory();

  try {
    await applyVariant({ destination, template: "tiny", variantsDirectory });

    assert.equal(existsSync(path.join(destination, "src", "example")), false);
    assert.equal(existsSync(path.join(destination, "README.md")), false);
    // Folders emptied by a removal are pruned, but non-empty parents stay.
    assert.equal(existsSync(path.join(destination, "src", "entities")), false);
    assert.equal(existsSync(path.join(destination, "src")), true);
    // `small` adds home.tsx, then `tiny` (applied after its base) removes it again.
    assert.equal(existsSync(path.join(destination, "src", "home.tsx")), false);
    assert.equal(await readFile(path.join(destination, "src", "main.tsx"), "utf8"), "tiny\n");
  } finally {
    await rm(destination, { recursive: true, force: true });
    await rm(variantsDirectory, { recursive: true, force: true });
  }
});

test("applyVariant leaves the project untouched for the full template", async () => {
  const destination = await createProjectDirectory();

  try {
    await applyVariant({ destination, template: "full", variantsDirectory: "/does/not/exist" });

    assert.equal(await readFile(path.join(destination, "src", "main.tsx"), "utf8"), "full\n");
    assert.equal(existsSync(path.join(destination, "src", "example", "page.tsx")), true);
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
});

test("applyVariant refuses paths outside the project", async () => {
  const variantsDirectory = await createFixtureVariants();
  const destination = await createProjectDirectory();

  try {
    await assert.rejects(
      applyVariant({ destination, template: "escape", variantsDirectory }),
      /escapes the project/,
    );
  } finally {
    await rm(destination, { recursive: true, force: true });
    await rm(variantsDirectory, { recursive: true, force: true });
  }
});

test("createProject ships the project's pnpm settings as pnpm-workspace.yaml", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "react-starter-output-"));
  const templateDirectory = await createFixtureTemplate();
  await writeFile(path.join(templateDirectory, "_pnpm-workspace.yaml"), "allowBuilds: {}");

  try {
    await createProject(
      { projectName: "my-app", install: false, force: false },
      { cwd, templateDirectory, userAgent: "pnpm/11.0.0 npm/? node/v24" },
    );

    const destination = path.join(cwd, "my-app");
    assert.equal(
      await readFile(path.join(destination, "pnpm-workspace.yaml"), "utf8"),
      "allowBuilds: {}",
    );
    assert.equal(existsSync(path.join(destination, "_pnpm-workspace.yaml")), false);
  } finally {
    await rm(cwd, { recursive: true, force: true });
    await rm(templateDirectory, { recursive: true, force: true });
  }
});

const readOverrides = async (file) => {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  const start = lines.indexOf("overrides:");
  const entries = [];

  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("  ")) break;
    entries.push(line.trim());
  }

  return entries;
};

test("generated projects get the same security overrides as this repository", async () => {
  const repositoryRoot = path.resolve(import.meta.dirname, "..", "..", "..");
  const workspaceOverrides = await readOverrides(path.join(repositoryRoot, "pnpm-workspace.yaml"));
  const templateOverrides = await readOverrides(
    path.join(repositoryRoot, "packages", "template", "_pnpm-workspace.yaml"),
  );

  assert.ok(workspaceOverrides.length > 0);
  assert.deepEqual(templateOverrides, workspaceOverrides);
});
