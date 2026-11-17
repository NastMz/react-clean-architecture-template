# Testing

Tests sit next to the code they cover (`*.test.ts(x)`) and talk to the same MSW mock backend as the dev server, so they exercise real requests, schemas and routing instead of mocked modules.

## Layers

| Layer       | Tool                           | Example                               | Covers                                 |
| ----------- | ------------------------------ | ------------------------------------- | -------------------------------------- |
| Unit        | Vitest                         | `entities/todo/model/summary.test.ts` | Pure rules and schemas                 |
| Integration | Vitest + Testing Library + MSW | `pages/todos/ui/TodosPage.test.tsx`   | A page through the real router and API |
| End-to-end  | Playwright                     | `e2e/todos.spec.ts`                   | User journeys in a real browser        |

## Writing an integration test

```tsx
import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { renderApp } from '../../../../test/render'

it('creates a todo', async () => {
  const { user } = renderApp('/todos', { signedIn: true })

  await user.type(await screen.findByLabelText('New todo'), 'Write tests')
  await user.click(screen.getByRole('button', { name: 'Add todo' }))

  expect(await screen.findByText('Write tests')).toBeInTheDocument()
})
```

- `renderApp(path, { signedIn })` renders the whole app with a memory router, so middleware and loaders run too.
- `renderWithProviders(ui)` renders a single component with TanStack Query and a router.
- `test/setup.ts` starts MSW, fails on unhandled requests and resets the mock database, storage and handlers after each test.
- Override a response for one test with `server.use(http.get('*/api/todos', () => HttpResponse.json([], { status: 500 })))`.
- Query by role and label (what users see). Avoid test ids and implementation details.

## Commands

```bash
pnpm test               # unit + integration
pnpm test:watch
pnpm test:coverage
pnpm exec playwright install chromium   # once per machine
pnpm test:e2e           # starts the dev server automatically
```

To run the end-to-end suite against a real backend, start the app with `VITE_API_MOCKING=disabled` and `VITE_API_URL` pointing at it. The specs assume the demo account and seed data, so adapt them to your fixtures.
