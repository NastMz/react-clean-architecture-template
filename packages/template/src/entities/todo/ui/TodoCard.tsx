import type { ReactNode } from 'react'

import type { Todo } from '../model/todo'
import styles from './TodoCard.module.css'

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export interface TodoCardProps {
  todo: Todo
  /** Slot before the title, typically a completion toggle. */
  leading?: ReactNode
  /** Slot after the title, typically links or actions. */
  trailing?: ReactNode
}

/** Visual representation of a todo. Interactions are injected through slots. */
export function TodoCard({ todo, leading, trailing }: TodoCardProps) {
  return (
    <article className={styles.card} data-completed={todo.completed}>
      {leading}
      <div className={styles.content}>
        <span className={styles.title}>{todo.title}</span>
        <span className={styles.meta}>
          {todo.completed ? 'Done' : 'Open'} · created{' '}
          <time dateTime={todo.createdAt}>{dateFormatter.format(new Date(todo.createdAt))}</time>
        </span>
      </div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </article>
  )
}
