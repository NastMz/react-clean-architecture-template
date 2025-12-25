/**
 * Represents a todo item in the system
 */
export interface Todo {
  id: string
  title: string
  completed: boolean
}

/**
 * Input data for creating a new todo item
 */
export interface CreateTodoInput {
  title: string
}
