import { Suspense } from 'react'
import { Link, NavLink, Outlet, useNavigation } from 'react-router'

import { useCurrentUser } from '@/entities/session'
import { LogoutButton } from '@/features/auth'
import { paths } from '@/shared/routes'
import { Spinner } from '@/shared/ui'

import styles from './AppLayout.module.css'

export function PageFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner />
    </div>
  )
}

export function AppLayout() {
  const user = useCurrentUser()
  const navigation = useNavigation()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={paths.home} className={styles.brand}>
          Clean React
        </Link>
        {user ? (
          <nav className={styles.nav} aria-label="Main">
            <NavLink
              to={paths.todos}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Todos
            </NavLink>
          </nav>
        ) : null}
        <div className={styles.session}>
          {navigation.state === 'loading' ? <Spinner label="Loading page" /> : null}
          {user ? (
            <>
              <span className={styles.user}>{user.name}</span>
              <LogoutButton />
            </>
          ) : null}
        </div>
      </header>
      <main className={styles.main}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
