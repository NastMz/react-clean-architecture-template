import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  createProject,
  detectPackageManager,
  formatCommand,
  getInstallCommand,
  parseArgs,
  validateProjectName,
} from "../bin/index.js";

async function createFixtureTemplate() {
  const root = await mkdtemp(path.join(os.tmpdir(), "clean-react-template-"));

  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "react-clean-architecture-template", private: true }, null, 2),
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
    install: true,
    force: false,
    help: false,
  });

  assert.deepEqual(parseArgs(["my-app", "--pm=pnpm", "--force"]), {
    projectName: "my-app",
    packageManager: "pnpm",
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
  const cwd = await mkdtemp(path.join(os.tmpdir(), "clean-react-output-"));
  const templateDirectory = await createFixtureTemplate();

  try {
    const result = await createProject(
      { projectName: "my-app", install: false, force: false },
      { cwd, templateDirectory, userAgent: "yarn/1.22.22 npm/? node/v24" },
    );

    const destination = path.join(cwd, "my-app");
    const generatedPackageJson = JSON.parse(await readFile(path.join(destination, "package.json"), "utf8"));

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
