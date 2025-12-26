# Shared Presentation Hooks

This directory contains **reusable UI hooks** that can be used across multiple features.

## What Goes Here?

**Generic UI utilities** that don't belong to a specific feature:

- `useToggle` - Boolean state toggle
- `useDebounce` - Debounced value
- `useMediaQuery` - Responsive breakpoint detection
- `useLocalStorage` - Persistent local storage state
- `useClickOutside` - Detect clicks outside an element
- `useOnMount` / `useOnUnmount` - Lifecycle utilities

## What DOESN'T Go Here?

❌ **Feature-specific hooks** → `features/<feature>/ui/hooks/`

- Example: `useAuthForm`, `useProductFilters`

❌ **Adapter hooks** (React Query wrappers) → `features/<feature>/adapters/`

- Example: `useLogin`, `useLogout`, `useProducts`

❌ **Domain/application logic** → Never in hooks! Keep in use cases.

## Example Hook

```typescript
import { useState, useCallback } from 'react'

export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle]
}
```

## Importing

```typescript
// ✅ Correct
import { useToggle } from '@shared/presentation/hooks/useToggle'

// ❌ Wrong (no default exports)
import useToggle from '@shared/presentation/hooks/useToggle'
```
