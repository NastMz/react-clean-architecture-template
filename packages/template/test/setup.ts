import '@testing-library/jest-dom/vitest'

import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { db } from '../mocks/db'
import { server } from '../mocks/node'

// The first render of a lazy route compiles the page on demand, which can take
// longer than the 1s default on a cold CI runner.
configure({ asyncUtilTimeout: 5000 })

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  db.reset()
  localStorage.clear()
})

afterAll(() => {
  server.close()
})
