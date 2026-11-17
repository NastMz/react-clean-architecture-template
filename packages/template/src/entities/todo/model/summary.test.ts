import { describe, expect, it } from 'vitest'

import { sortTodosForDisplay, summarizeTodos } from './summary'
import type { Todo } from './todo'

const todo = (id: string, completed: boolean, createdAt: string): Todo => ({
  id,
  title: `Todo ${id}`,
  completed,
  createdAt,
})

describe('summarizeTodos', () => {
  it('returns zeros for an empty list', () => {
    expect(summarizeTodos([])).toEqual({ total: 0, completed: 0, remaining: 0, completionRate: 0 })
  })

  it('counts completed and remaining todos and rounds the completion rate', () => {
    const todos = [
      todo('1', true, '2026-01-01T00:00:00.000Z'),
      todo('2', false, '2026-01-02T00:00:00.000Z'),
      todo('3', false, '2026-01-03T00:00:00.000Z'),
    ]

    expect(summarizeTodos(todos)).toEqual({
      total: 3,
      completed: 1,
      remaining: 2,
      completionRate: 33,
    })
  })
})

describe('sortTodosForDisplay', () => {
  it('lists open todos first, newest first within each group, without mutating input', () => {
    const todos = [
      todo('old-done', true, '2026-01-01T00:00:00.000Z'),
      todo('old-open', false, '2026-01-02T00:00:00.000Z'),
      todo('new-done', true, '2026-01-03T00:00:00.000Z'),
      todo('new-open', false, '2026-01-04T00:00:00.000Z'),
    ]
    const snapshot = [...todos]

    expect(sortTodosForDisplay(todos).map(({ id }) => id)).toEqual([
      'new-open',
      'old-open',
      'new-done',
      'old-done',
    ])
    expect(todos).toEqual(snapshot)
  })
})
