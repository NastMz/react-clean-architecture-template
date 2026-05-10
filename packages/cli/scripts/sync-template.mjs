import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cliDirectory = path.resolve(scriptDirectory, "..");
const sourceTemplate = path.resolve(cliDirectory, "..", "template");
const bundledTemplate = path.resolve(cliDirectory, "template");

await rm(bundledTemplate, { recursive: true, force: true });
await mkdir(bundledTemplate, { recursive: true });

await cp(sourceTemplate, bundledTemplate, {
  recursive: true,
  filter: (source) => !shouldExclude(source),
});

function shouldExclude(source) {
  const relativePath = path.relative(sourceTemplate, source);

  if (!relativePath) {
    return false;
  }

  return relativePath.split(path.sep).some((entry) => EXCLUDED_ENTRIES.has(entry));
}
