import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../../test/render'

describe('TodoDetailsPage', () => {
  it('renames a todo', async () => {
    const { user } = renderApp('/todos/todo-2', { signedIn: true })

    const input = await screen.findByLabelText('Title')
    await user.clear(input)
    await user.type(input, 'Read the FSD reference')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByRole('heading', { name: 'Read the FSD reference' }),
    ).toBeInTheDocument()
  })

  it('rejects a title that another todo already uses', async () => {
    const { user } = renderApp('/todos/todo-2', { signedIn: true })

    const input = await screen.findByLabelText('Title')
    await user.clear(input)
    await user.type(input, 'Ship your first feature')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A todo with this title already exists',
    )
  })

  it('deletes a todo and returns to the list', async () => {
    const { user, router } = renderApp('/todos/todo-2', { signedIn: true })

    await user.click(await screen.findByRole('button', { name: 'Delete todo' }))

    expect(await screen.findByRole('heading', { name: 'Todos' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/todos')
    expect(screen.queryByText('Read the architecture guide')).not.toBeInTheDocument()
  })
})
