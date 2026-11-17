# Architecture

The app follows [Feature-Sliced Design v2.1](https://feature-sliced.design). FSD plays the role Clean Architecture plays on the backend: a published, tool-checked standard that says where code goes and which way dependencies point.

## Layers

Each layer may import only from the layers **below** it.

| Layer      | Holds                                                        | In this template                                         |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `app`      | Everything app-wide: entrypoint, router, layout, query cache | `entrypoint/`, `routes/`, `layout/`, `cache/`, `styles/` |
| `pages`    | One slice per screen, with its page-only forms and requests  | `login`, `todos`, `todo-details`, `not-found`            |
| `features` | User actions reused on more than one page                    | `auth` (sign in/out), `toggle-todo`                      |
| `entities` | Business concepts: schemas, rules, API requests, display UI  | `session`, `todo`                                        |
| `shared`   | Business-agnostic foundation                                 | `api/`, `config/`, `routes/`, `ui/`                      |

`widgets` is not used: the FSD guide discourages it unless a composed block is reused across pages. `processes` is deprecated.

## Rules

1. **Import rule.** A slice imports only from lower layers. Two slices on the same layer never import each other; entities that must reference each other use the `@x` public API (`entities/a/@x/b.ts`).
2. **Public API.** Every slice exposes an `index.ts` with explicit named exports (no `export *`). Other slices import `@/entities/todo`, never `@/entities/todo/model/todo`.
3. **Imports inside a slice are relative; imports across slices use the `@/` alias.** This avoids circular imports through the slice's own `index.ts`.
4. **Segments are named by purpose**: `ui`, `model`, `api`, `lib`, `config`. Names such as `hooks`, `components`, `types` or `utils` are rejected.
5. **Pages first.** Code used by a single page stays inside that page. Extract to `features` or `entities` only when a second consumer appears (`toggle-todo` is a feature because both todo pages use it; `CreateTodoForm` stays in the `todos` page).

`pnpm lint:fsd` runs [Steiger](https://github.com/feature-sliced/steiger) with the recommended FSD rules and fails CI on any violation. ESLint handles code quality only.

## Data flow

```text
page / feature UI
  └─ TanStack Query hook  ── useSuspenseQuery(todoQueries.list())
       └─ entity api      ── fetchTodos() → apiClient.get('/todos', z.array(todoSchema))
            └─ shared/api ── fetch + bearer token + Zod validation → typed data or ApiError
```

- **Query factories** (`todoQueries.list()`, `todoQueries.detail(id)`) own query keys and fetchers, so components, loaders and mutations share one definition.
- **Route loaders** call `queryClient.query(...)` so data starts loading in parallel with the page's code chunk; the page reads it with `useSuspenseQuery`.
- **Mutations** live where they are used (page `api/` segment or a feature) and invalidate by key, for example `todoQueries.list().queryKey`.
- **Every response is parsed with Zod.** A backend that drifts from the contract fails loudly at the boundary instead of deep in the UI.
- **Errors**: non-2xx responses become `ApiError` with the server's `message` and `status`. 4xx are not retried. Route errors render `RouteErrorBoundary`.

## Authentication

- `entities/session` owns the session: `login`, `logout`, `getCurrentUser` and the `currentUser` query.
- `features/auth` provides the `LoginForm` and `LogoutButton` user actions.
- `app/routes/auth-middleware.ts` protects routes with React Router **middleware**. Middleware runs before any loader of the protected branch, so loaders never fire requests for an anonymous user (plain loaders run in parallel and cannot gate each other).
- Unauthenticated users are redirected to `/login?redirectTo=<path>`; `getSafeRedirect` only accepts same-origin paths, so the parameter cannot be used as an open redirect.
- The bearer token lives in `localStorage` (`shared/api/auth-token.ts`) to keep the demo simple. If your backend supports it, prefer an `httpOnly` cookie and drop the token code.

## Where does my code go?

| You are adding…                                          | Put it in                                  |
| -------------------------------------------------------- | ------------------------------------------ |
| A new screen                                             | `pages/<name>` and a route in `app/routes` |
| A form or request used by that screen only               | The page's `ui/` or `api/` segment         |
| An action users take on several screens                  | `features/<verb-noun>`                     |
| A business concept, its schema, rules and API requests   | `entities/<noun>`                          |
| A generic UI component or HTTP/config helper             | `shared/ui`, `shared/api`, `shared/config` |
| Providers, global styles, router, app-wide configuration | `app`                                      |

## Out of scope

The template deliberately leaves out choices that depend on your product: a global client-state store (add Zustand to a `model` segment when you need one), i18n (`shared/i18n`), analytics and error reporting (wire them in `app`), and a component library or Tailwind (replace `shared/ui`).
