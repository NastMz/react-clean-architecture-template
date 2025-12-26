import { Link, Outlet } from 'react-router-dom'

import { AppHeader, AppMain, AppNav, AppShell, Brand } from './atoms/Layout'

/**
 * Root Layout Component
 * Provides the main shell of the application with navigation header
 * Uses React Router Outlet for nested route rendering
 */
export const RootLayout = () => {
  return (
    <AppShell>
      <AppHeader>
        <Brand>Clean React Starter</Brand>
        <AppNav>
          <Link to="/auth" className={({ isActive }) => (isActive ? 'active' : '')}>
            Auth
          </Link>
          <Link to="/todos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Todos
          </Link>
        </AppNav>
      </AppHeader>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  )
}
