# create-clean-react

Create a React SPA organized with [Feature-Sliced Design](https://feature-sliced.design), with React Router 8, TanStack Query, Zod, MSW, Vitest, Playwright and Storybook already wired.

## Usage

```bash
npm create @nastmz/clean-react@latest my-app
pnpm create @nastmz/clean-react my-app
yarn create @nastmz/clean-react my-app
bun create @nastmz/clean-react my-app
```

The CLI detects the invoking package manager and prints matching next steps. The generated project's scripts, Git hooks and CI use pnpm.

## Options

| Option                        | Effect                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| `--pm <npm\|pnpm\|yarn\|bun>` | Override package-manager detection                          |
| `--install`                   | Install dependencies after scaffolding (skipped by default) |
| `--force`                     | Allow writing into a non-empty directory                    |

Requires Node.js 22.22 or later. See the [template documentation](https://github.com/NastMz/react-clean-architecture-template/tree/main/packages/template) for the architecture and workflows.
