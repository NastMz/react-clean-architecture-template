import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../../test/render'

describe('TodosPage', () => {
  it('lists todos with open ones first and shows the summary', async () => {
    renderApp('/todos', { signedIn: true })

    const list = await screen.findByRole('list', { name: 'Todos' })
    const toggles = within(list)
      .getAllByRole('checkbox')
      .map((checkbox) => checkbox.getAttribute('aria-label'))

    expect(toggles).toEqual([
      'Mark "Ship your first feature" as done',
      'Mark "Read the architecture guide" as done',
      'Mark "Explore the Feature-Sliced layers" as open',
    ])
    expect(screen.getByText('2 open · 1 done · 33% complete')).toBeInTheDocument()
  })

  it('creates a todo and clears the form', async () => {
    const { user } = renderApp('/todos', { signedIn: true })

    const input = await screen.findByLabelText('New todo')
    await user.type(input, 'Write integration tests')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))

    expect(await screen.findByText('Write integration tests')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(screen.getByText('3 open · 1 done · 25% complete')).toBeInTheDocument()
  })

  it('validates the title on the client', async () => {
    const { user } = renderApp('/todos', { signedIn: true })

    await user.click(await screen.findByRole('button', { name: 'Add todo' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
  })

  it('shows the server error for a duplicate title', async () => {
    const { user } = renderApp('/todos', { signedIn: true })

    await user.type(await screen.findByLabelText('New todo'), 'ship your first feature')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A todo with this title already exists',
    )
  })

  it('toggles a todo', async () => {
    const { user } = renderApp('/todos', { signedIn: true })

    await user.click(
      await screen.findByRole('checkbox', { name: 'Mark "Ship your first feature" as done' }),
    )

    expect(
      await screen.findByRole('checkbox', { name: 'Mark "Ship your first feature" as open' }),
    ).toBeChecked()
    expect(screen.getByText('1 open · 2 done · 67% complete')).toBeInTheDocument()
  })
})
