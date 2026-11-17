/**
 * In-memory data store for the mock backend. It stands in for a real API so the
 * template runs without a server; delete the `mocks/` folder once you have one.
 */

export interface MockUser {
  id: string
  email: string
  name: string
  password: string
}

export interface MockTodo {
  id: string
  ownerId: string
  title: string
  completed: boolean
  createdAt: string
}

const users: readonly MockUser[] = [
  { id: 'user-1', email: 'demo@example.com', name: 'Demo User', password: 'demo123' },
]

const seedTodos = (): MockTodo[] => [
  {
    id: 'todo-1',
    ownerId: 'user-1',
    title: 'Explore the Feature-Sliced layers',
    completed: true,
    createdAt: '2026-01-05T09:00:00.000Z',
  },
  {
    id: 'todo-2',
    ownerId: 'user-1',
    title: 'Read the architecture guide',
    completed: false,
    createdAt: '2026-01-06T09:00:00.000Z',
  },
  {
    id: 'todo-3',
    ownerId: 'user-1',
    title: 'Ship your first feature',
    completed: false,
    createdAt: '2026-01-07T09:00:00.000Z',
  },
]

let todos = seedTodos()

const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export const db = {
  users: {
    findByCredentials: (email: string, password: string) =>
      users.find((user) => user.email === email && user.password === password),
    findById: (id: string) => users.find((user) => user.id === id),
  },
  todos: {
    list: (ownerId: string) => todos.filter((todo) => todo.ownerId === ownerId),
    find: (ownerId: string, id: string) =>
      todos.find((todo) => todo.ownerId === ownerId && todo.id === id),
    hasTitle: (ownerId: string, title: string, exceptId?: string) =>
      todos.some(
        (todo) => todo.ownerId === ownerId && todo.id !== exceptId && sameTitle(todo.title, title),
      ),
    create: (ownerId: string, title: string): MockTodo => {
      const todo: MockTodo = {
        id: crypto.randomUUID(),
        ownerId,
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      todos = [...todos, todo]
      return todo
    },
    update: (id: string, changes: Partial<Pick<MockTodo, 'title' | 'completed'>>) => {
      todos = todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo))
      return todos.find((todo) => todo.id === id)
    },
    remove: (id: string) => {
      todos = todos.filter((todo) => todo.id !== id)
    },
  },
  /** Restores the seed data. Tests call this before each case. */
  reset: () => {
    todos = seedTodos()
  },
}

/** Deterministic token so a browser reload keeps the demo session alive. */
export const tokenForUser = (userId: string) => `mock-token.${userId}`

export const userIdFromToken = (token: string) =>
  token.startsWith('mock-token.') ? token.slice('mock-token.'.length) : undefined
