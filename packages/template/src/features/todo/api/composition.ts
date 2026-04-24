// Wiring-facing public API for extension manifests, composition root, and tests.
export type { TodoAdapters } from '../adapters/todoAdapters'
export { createTodoAdapters } from '../adapters/todoAdapters'
export { createTodoUseCases } from '../application/todoUseCases'
export { TodoAdaptersProvider } from '../composition/TodoAdaptersProvider'
export { createInMemoryTodoRepository } from '../infra/inMemoryTodoRepository'
