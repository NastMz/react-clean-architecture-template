import type { Todo } from '@/entities/todo'

import { useToggleTodo } from '../api/useToggleTodo'
import styles from './ToggleTodoCheckbox.module.css'

export function ToggleTodoCheckbox({ todo }: { todo: Todo }) {
  const toggleMutation = useToggleTodo()

  return (
    <span className={styles.wrapper}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        disabled={toggleMutation.isPending}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'open' : 'done'}`}
        onChange={() => {
          toggleMutation.mutate(todo)
        }}
      />
      {toggleMutation.isError ? (
        <span role="alert" className={styles.error}>
          Could not update
        </span>
      ) : null}
    </span>
  )
}
