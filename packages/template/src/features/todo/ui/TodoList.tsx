import { Stack } from '@shared/ui/atoms/Layout'
import { Muted, Title } from '@shared/ui/atoms/Typography'

import type { Todo } from '../domain/Todo'
import { TodoEmptyState } from './TodoEmptyState'
import styles from './TodoList.module.css'
import { TodoListItem } from './TodoListItem'

interface TodoListProps {
  editingTitle: string
  editingTodoId: string | null
  isLoading: boolean
  onDeleteTodo: (todoId: string) => void
  onEditTitleChange: (value: string) => void
  onSaveEdit: (todoId: string) => void
  onStartEdit: (todo: Todo) => void
  onToggleTodo: (todoId: string) => void
  todos: readonly Todo[]
}

export const TodoList = ({
  editingTitle,
  editingTodoId,
  isLoading,
  onDeleteTodo,
  onEditTitleChange,
  onSaveEdit,
  onStartEdit,
  onToggleTodo,
  todos,
}: TodoListProps) => {
  return (
    <Stack className={styles.panel} role="region" aria-label="Todo list panel">
      <div className={styles.header}>
        <Title>Tasks</Title>
        <Muted>{todos.length} items</Muted>
      </div>
      {isLoading ? <Muted>Loading todos…</Muted> : null}
      {!isLoading && todos.length === 0 ? <TodoEmptyState /> : null}
      <ul className={styles.list}>
        {todos.map((todo) => {
          const isEditing = editingTodoId === todo.id

          return (
            <TodoListItem
              key={todo.id}
              editingTitle={editingTitle}
              isEditing={isEditing}
              onDelete={() => onDeleteTodo(todo.id)}
              onEditChange={onEditTitleChange}
              onSave={() => onSaveEdit(todo.id)}
              onStartEdit={() => onStartEdit(todo)}
              onToggle={() => onToggleTodo(todo.id)}
              todo={todo}
            />
          )
        })}
      </ul>
    </Stack>
  )
}
