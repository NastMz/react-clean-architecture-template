export interface Todo {
  id: string
  title: string
  completed: boolean
}

export interface CreateTodoInput {
  title: string
}

export interface UpdateTodoInput {
  title: string
}
