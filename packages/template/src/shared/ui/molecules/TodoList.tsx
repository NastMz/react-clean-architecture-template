import type { ReactNode } from 'react'

import styles from './TodoList.module.css'

/**
 * TodoList molecule component
 * Renders a list of todo items
 */
export const TodoList = ({ children }: { children: ReactNode }) => (
  <ul className={styles.todoList}>{children}</ul>
)

/**
 * TodoItem molecule component
 * Individual todo item with checkbox and title
 */
interface TodoItemProps {
  completed: boolean
  children: ReactNode
  onToggle: () => void
}

export const TodoItem = ({ completed, children, onToggle }: TodoItemProps) => (
  <li className={styles.todoItem}>
    <label className={styles.label}>
      <input type="checkbox" checked={completed} onChange={onToggle} />
      <span className={completed ? styles.strikethrough : ''}>{children}</span>
    </label>
  </li>
)
