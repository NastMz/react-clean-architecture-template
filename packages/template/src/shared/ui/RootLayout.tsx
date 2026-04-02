import { NavLink, Outlet } from 'react-router-dom'

import { AppHeader, AppMain, AppNav, AppShell, Brand } from './atoms/Layout'

interface RootLayoutNavigationItem {
  label: string
  to: string
}

interface RootLayoutProps {
  navigationItems: readonly RootLayoutNavigationItem[]
}

/**
 * Root Layout Component
 * Provides the main shell of the application with navigation header
 * Uses React Router Outlet for nested route rendering
 *
 * Navigation is injected from app-level composition
 */
export const RootLayout = ({ navigationItems }: RootLayoutProps) => {
  return (
    <AppShell>
      <AppHeader>
        <Brand>Clean React Starter</Brand>
        <AppNav>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </AppNav>
      </AppHeader>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  )
}
