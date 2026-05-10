# create-clean-react

Create a React Clean Architecture SPA without manually copying the template.

## Usage

Use the package manager you already use:

```bash
npm create clean-react@latest my-app
pnpm create clean-react my-app
yarn create clean-react my-app
bun create clean-react my-app
```

The CLI detects the invoking package manager and prints matching next steps.

## Options

```bash
create-clean-react my-app --pm npm
create-clean-react my-app --pm pnpm
create-clean-react my-app --pm yarn
create-clean-react my-app --pm bun
create-clean-react my-app --install
create-clean-react my-app --force
```

- `--pm` overrides package-manager detection.
- `--install` installs dependencies after scaffolding.
- `--force` allows writing into an existing directory.

By default, dependency installation is skipped and the CLI prints the commands to run next.
