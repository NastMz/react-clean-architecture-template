import { Button } from '@shared/ui/atoms/Button'
import { Input } from '@shared/ui/atoms/Input'
import { Row, Stack } from '@shared/ui/atoms/Layout'
import { Muted } from '@shared/ui/atoms/Typography'

import type { Todo } from '../domain/Todo'

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
    <li aria-label={`Todo ${todo.title}`}>
      <Stack>
        <label>
          <Input
            type="checkbox"
            aria-label={`Mark ${todo.title} as complete`}
            checked={todo.completed}
            onChange={onToggle}
          />
          <span>{todo.title}</span>
        </label>
        <Muted>Status: {todo.completed ? 'done' : 'pending'}</Muted>
        {isEditing ? (
          <Row>
            <Input
              type="text"
              aria-label={`Edit title for ${todo.title}`}
              value={editingTitle}
              onChange={(event) => {
                onEditChange(event.target.value)
              }}
            />
            <Button type="button" onClick={onSave}>
              Save {editingTitle}
            </Button>
          </Row>
        ) : (
          <Row>
            <Button type="button" onClick={onStartEdit}>
              Edit {todo.title}
            </Button>
          </Row>
        )}
        <Row>
          <Button type="button" onClick={onDelete}>
            Delete {todo.title}
          </Button>
        </Row>
      </Stack>
    </li>
  )
}
