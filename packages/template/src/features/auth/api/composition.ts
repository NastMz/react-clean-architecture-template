// Wiring-facing public API for extension manifests, composition root, and tests.
export type { AuthAdapters } from '../adapters/authAdapters'
export { createAuthAdapters } from '../adapters/authAdapters'
export { createAuthUseCases } from '../application/authUseCases'
export { AuthAdaptersProvider } from '../composition/AuthAdaptersProvider'
export { createHttpAuthRepository } from '../infra/httpAuthRepository'
export { createInMemoryAuthRepository } from '../infra/inMemoryAuthRepository'
