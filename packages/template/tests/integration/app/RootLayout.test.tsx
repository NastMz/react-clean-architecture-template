import { getAppFeatureNavigation } from '@app/extensions/registry'
import { RootLayout } from '@shared/ui/RootLayout'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

describe('RootLayout', () => {
  it('renders navigation links from the app feature registry', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <Routes>
          <Route path="/" element={<RootLayout navigationItems={getAppFeatureNavigation()} />}>
            <Route index element={<div>home</div>} />
            <Route path="auth" element={<div>auth</div>} />
            <Route path="products" element={<div>products</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Auth' })).toHaveAttribute('href', '/auth')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveClass('active')
  })
})
