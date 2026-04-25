import { getAppFeatureNavigation } from '@app/extensions/registry'
import { RootLayout } from '@shared/ui/RootLayout'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('RootLayout', () => {
  it('renders navigation links from the app feature registry', () => {
    render(
      <MemoryRouter initialEntries={['/todo']}>
        <Routes>
          <Route path="/" element={<RootLayout navigationItems={getAppFeatureNavigation()} />}>
            <Route index element={<div>home</div>} />
            <Route path="auth" element={<div>auth</div>} />
            <Route path="todo" element={<div>todo</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Auth' })).toHaveAttribute('href', '/auth')
    expect(screen.getByRole('link', { name: 'Todo' })).toHaveAttribute('href', '/todo')
    expect(screen.getByRole('link', { name: 'Todo' })).toHaveClass('active')
  })
})
