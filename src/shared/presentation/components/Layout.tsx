import { NavLink, Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Clean React Starter</div>
        <nav className="app-nav">
          <NavLink
            to="/auth"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Auth
          </NavLink>
          <NavLink
            to="/todos"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Todos
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
