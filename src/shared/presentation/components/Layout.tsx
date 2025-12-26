import { NavLink, Outlet } from 'react-router-dom'

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
          <NavLink to="/auth" className={({ isActive }) => (isActive ? 'active' : '')}>
            Auth
          </NavLink>
          <NavLink to="/todos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Todos
          </NavLink>
          <NavLink to="/posts" className={({ isActive }) => (isActive ? 'active' : '')}>
            Posts
          </NavLink>
        </AppNav>
      </AppHeader>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  )
}
