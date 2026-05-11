import { Button } from '@shared/ui/atoms/Button'
import { Input } from '@shared/ui/atoms/Input'
import { Muted } from '@shared/ui/atoms/Typography'

import type { Todo } from '../domain/Todo'
import styles from './TodoListItem.module.css'

interface TodoListItemProps {
  editingTitle: string
  isEditing: boolean
  onDelete: () => void
  onEditChange: (value: string) => void
  onSave: () => void
  onStartEdit: () => void
  onToggle: () => void
  todo: Todo
}

export const TodoListItem = ({
  editingTitle,
  isEditing,
  onDelete,
  onEditChange,
  onSave,
  onStartEdit,
  onToggle,
  todo,
}: TodoListItemProps) => {
  return (
    <li className={styles.item} aria-label={`Todo ${todo.title}`}>
      <div className={styles.content}>
        <label className={styles.checkLabel}>
          <Input
            type="checkbox"
            aria-label={`Mark ${todo.title} as complete`}
            checked={todo.completed}
            onChange={onToggle}
          />
          <span className={todo.completed ? styles.completedTitle : styles.title}>
            {todo.title}
          </span>
        </label>
        <Muted>Status: {todo.completed ? 'done' : 'pending'}</Muted>
        {isEditing ? (
          <div className={styles.editRow}>
            <Input
              type="text"
              aria-label={`Edit title for ${todo.title}`}
              value={editingTitle}
              onChange={(event) => {
                onEditChange(event.target.value)
              }}
            />
            <Button type="button" size="icon" onClick={onSave} aria-label={`Save ${editingTitle}`}>
              ✓
            </Button>
          </div>
        ) : null}
      </div>
      <div className={styles.actions}>
        {!isEditing ? (
          <Button
            type="button"
            variant="subtle"
            size="icon"
            onClick={onStartEdit}
            aria-label={`Edit ${todo.title}`}
          >
            ✎
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={`Delete ${todo.title}`}
        >
          ×
        </Button>
      </div>
    </li>
  )
}
