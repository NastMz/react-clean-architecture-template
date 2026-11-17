# create-react-starter

Create a production-ready React SPA organized with [Feature-Sliced Design](https://feature-sliced.design), with React Router 8, TanStack Query, Zod, MSW, Vitest, Playwright and Storybook already wired.

## Usage

```bash
npm create @nastmz/react-starter@latest my-app
pnpm create @nastmz/react-starter my-app
yarn create @nastmz/react-starter my-app
bun create @nastmz/react-starter my-app
```

The CLI detects the invoking package manager and prints matching next steps. The generated project's scripts, Git hooks and CI use pnpm.

## Templates

| `--template`     | You get                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| `full` (default) | A small todo app showing every layer: sign-in, pages, features, entities, mocks |
| `minimal`        | Sign-in, an empty home page and the full toolchain, no example data             |
| `blank`          | An empty home page and the full toolchain, no sign-in                           |

```bash
pnpm create @nastmz/react-starter my-app --template minimal
```

## Options

| Option                        | Effect                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| `-t, --template <name>`       | Starting point: `full`, `minimal` or `blank`                |
| `--pm <npm\|pnpm\|yarn\|bun>` | Override package-manager detection                          |
| `--install`                   | Install dependencies after scaffolding (skipped by default) |
| `--force`                     | Allow writing into a non-empty directory                    |

Requires Node.js 22.22 or later. See the [template documentation](https://github.com/NastMz/react-starter/tree/main/packages/template) for the architecture and workflows.

## How templates work

`full` is the template as-is. `minimal` and `blank` live in [`variants/`](variants): each one lists paths to remove and ships replacement files, and `blank` builds on `minimal`. CI generates every template and runs its checks, so they cannot drift from the full template.
