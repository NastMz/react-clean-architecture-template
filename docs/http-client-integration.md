# HttpClient Integration Pattern

## Overview

This document explains how the Posts feature demonstrates proper HttpClient usage within Clean Architecture, with type-safe error handling using the Result<T, E> monad.

## Architecture Layers

### 1. Domain Layer (Post.ts)

Defines the core entity:

```typescript
interface Post {
  id: number
  title: string
  body: string
  userId: number
}
```

### 2. Application Layer (postUseCases.ts)

Orchestrates business logic:

- `getPosts(): Promise<Result<Post[], AppError>>`
- `getPost(id: number): Promise<Result<Post, AppError>>`

### 3. Infrastructure Layer (httpPostRepository.ts)

Implements the repository using HttpClient:

- Fetches from JSONPlaceholder API
- Converts `Result<HttpResponse<T>, AppError>` to `Result<T, AppError>`
- Uses `Result.map()` to extract data: `result.map(response => response.data)`

### 4. Adapter Layer (postAdapters.ts)

Translates between Result<T, E> and React Query:

- Creates `queryFn` functions that check Result state
- Throws `PostsError` for error cases (React Query compatible)
- Returns unwrapped data for success cases
- Properly types return values as `Promise<Post[]>` or `Promise<Post>`

### 5. Custom Hooks (usePostsQueries.ts)

Provides clean API to UI layer:

- `usePostsList(): UseQueryResult<Post[], Error>`
- `usePost(id: number | null): UseQueryResult<Post, Error>`
- Hides Result<T, E> complexity from components

### 6. UI Layer (PostsPage.tsx)

Uses hooks without Result handling concerns:

- Explicitly types data as `Post[]` or `Post`
- Simple error and loading state handling
- No linter disabling needed

## Key Design Decisions

### Why Custom Hooks?

React Query's generic types work best when the error type is `Error`. Custom hooks bridge the gap between:

- **Adapter layer**: Works with `Result<T, AppError>`
- **React Query**: Works with `Promise<T>` and throws `Error`
- **UI layer**: Gets clean `UseQueryResult<T, Error>`

### Why PostsError Class?

ESLint `@typescript-eslint/only-throw-error` requires throwing Error instances, not arbitrary objects. PostsError wraps AppError messages while satisfying TypeScript constraints.

### Why Explicit Type Guards?

Using `result.isErr` (property) instead of `result.isErr()` (method) provides clear distinction between checking state and throwing errors.

## Type Safety Benefits

✅ **No type casting needed** - Result<T, E> properly narrows types
✅ **No `any` types** - All types are explicitly defined
✅ **No linter disabling** - Code follows all ESLint rules
✅ **Compiler verified** - TypeScript ensures correctness
✅ **React Query compatible** - Proper error boundaries

## Usage Example

```typescript
export const PostsPage = () => {
  const postsQuery = usePostsList()

  return (
    <div>
      {postsQuery.isLoading && <p>Loading...</p>}
      {postsQuery.isError && <p>{postsQuery.error.message}</p>}
      {postsQuery.data && (
        <ul>
          {postsQuery.data.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Extending This Pattern

To add new features using HttpClient:

1. **Domain**: Define entity interface
2. **Application**: Create use cases returning `Promise<Result<T, AppError>>`
3. **Infrastructure**: Implement repository using HttpClient
4. **Adapter**: Create queryFn that converts Result → Error handling
5. **Hooks**: Wrap with custom hooks for clean API
6. **UI**: Use hooks without Result concerns

This ensures:

- Clean separation of concerns
- Type safety throughout the stack
- Reusable pattern for all API integrations
- No architectural compromises for linter compliance
