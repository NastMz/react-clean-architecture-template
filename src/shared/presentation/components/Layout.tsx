import { NavLink, Outlet } from 'react-router-dom'

import ui from '../../../styles/ui.module.css'

/**
 * Root Layout Component
 * Provides the main shell of the application with navigation header
 * Uses React Router Outlet for nested route rendering
 */
export const RootLayout = () => {
  return (
    <div className={ui.appShell}>
      <header className={ui.appHeader}>
        <div className={ui.brand}>Clean React Starter</div>
        <nav className={ui.appNav}>
          <NavLink
            to="/auth"
            className={({ isActive }) => (isActive ? `${ui.navLink} ${ui.active}` : ui.navLink)}
          >
            Auth
          </NavLink>
          <NavLink
            to="/todos"
            className={({ isActive }) => (isActive ? `${ui.navLink} ${ui.active}` : ui.navLink)}
          >
            Todos
          </NavLink>
        </nav>
      </header>
      <main className={ui.appMain}>
        <Outlet />
      </main>
    </div>
  )
}
