import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'

import { TodoCard, todoQueries } from '@/entities/todo'
import { ToggleTodoCheckbox } from '@/features/toggle-todo'
import { getErrorMessage } from '@/shared/api'
import { paths } from '@/shared/routes'
import { Alert, Button, Card } from '@/shared/ui'

import { useDeleteTodo } from '../api/useTodoMutations'
import { RenameTodoForm } from './RenameTodoForm'
import styles from './TodoDetailsPage.module.css'

export function TodoDetailsPage() {
  const { todoId = '' } = useParams()
  const navigate = useNavigate()
  const { data: todo } = useSuspenseQuery(todoQueries.detail(todoId))
  const deleteMutation = useDeleteTodo(todoId)

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        void navigate(paths.todos, { replace: true })
      },
    })
  }

  return (
    <Card
      eyebrow="Todo"
      title={todo.title}
      actions={
        <Link className={styles.back} to={paths.todos}>
          ← All todos
        </Link>
      }
    >
      <div className={styles.stack}>
        <TodoCard todo={todo} leading={<ToggleTodoCheckbox todo={todo} />} />
        {/* Keyed by title so the form resets when the todo changes elsewhere. */}
        <RenameTodoForm key={todo.title} todo={todo} />
        <section className={styles.danger} aria-labelledby="danger-zone">
          <h2 id="danger-zone" className={styles.dangerTitle}>
            Delete todo
          </h2>
          <p className={styles.dangerText}>This permanently removes the todo.</p>
          {deleteMutation.isError ? <Alert>{getErrorMessage(deleteMutation.error)}</Alert> : null}
          <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete todo'}
          </Button>
        </section>
      </div>
    </Card>
  )
}
