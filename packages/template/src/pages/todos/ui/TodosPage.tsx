import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { sortTodosForDisplay, summarizeTodos, TodoCard, todoQueries } from '@/entities/todo'
import { ToggleTodoCheckbox } from '@/features/toggle-todo'
import { paths } from '@/shared/routes'
import { Card } from '@/shared/ui'

import { CreateTodoForm } from './CreateTodoForm'
import styles from './TodosPage.module.css'

export function TodosPage() {
  const { data: todos } = useSuspenseQuery(todoQueries.list())
  const summary = summarizeTodos(todos)

  return (
    <Card
      eyebrow="Workspace"
      title="Todos"
      description={`${summary.remaining} open · ${summary.completed} done · ${summary.completionRate}% complete`}
    >
      <div className={styles.stack}>
        <CreateTodoForm />
        {todos.length === 0 ? (
          <p className={styles.empty}>Nothing here yet. Add your first todo above.</p>
        ) : (
          <ul className={styles.list} aria-label="Todos">
            {sortTodosForDisplay(todos).map((todo) => (
              <li key={todo.id}>
                <TodoCard
                  todo={todo}
                  leading={<ToggleTodoCheckbox todo={todo} />}
                  trailing={
                    <Link className={styles.link} to={paths.todoDetails(todo.id)}>
                      Details
                      <span className={styles.visuallyHidden}> for {todo.title}</span>
                    </Link>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
