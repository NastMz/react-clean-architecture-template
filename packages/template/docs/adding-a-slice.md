# Adding a slice

Example: a **Settings** page where users change their display name.

## Quick path

```bash
pnpm slice pages settings          # src/pages/settings/{index.ts, ui/SettingsPage.tsx}
```

1. Build the screen in `src/pages/settings/ui/SettingsPage.tsx`.
2. Register the route in `src/app/routes/routes.tsx`, inside the protected branch:

   ```tsx
   {
     path: paths.settings,
     lazy: async () => ({ Component: (await import('@/pages/settings')).SettingsPage }),
   },
   ```

3. Add the path to `src/shared/routes/paths.ts` (`settings: '/settings'`) and link to it from `app/layout`.
4. Run `pnpm check`.

## Choosing the layer

Start in the page. Move code down only when a second slice needs it:

| Situation                                            | Action                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| The rename form is only on the settings page         | Keep it in `pages/settings/ui`, its mutation in `pages/settings/api` |
| The profile header now appears on two pages too      | `pnpm slice features edit-profile` and move it there                 |
| Several slices need the `User` type and its requests | Extend `entities/session` or create `entities/user`                  |

Generator usage:

```bash
pnpm slice <pages|widgets|features|entities> <kebab-name> [--segments ui,model,api,lib,config]
```

Defaults: pages `ui`; features `ui,model`; entities `model,api`. The generator never overwrites an existing slice.

## Adding an API endpoint

1. Schema in the entity's `model` (Zod), inferred type next to it.
2. Request function in the entity's `api`, using `apiClient` with that schema.
3. Query factory entry (for reads) or a mutation hook in the slice that uses it.
4. A handler in `mocks/handlers.ts` so dev and tests keep working without a backend.
5. Export only what other slices need from the slice's `index.ts`.

## Checklist

- [ ] Imports across slices go through `@/<layer>/<slice>`, never into a slice's internals.
- [ ] `pnpm lint:fsd` passes (Steiger also flags slices with a single consumer).
- [ ] New behavior has a test next to it; see [testing.md](testing.md).
