import { Suspense } from 'react'
import { Link, NavLink, Outlet, useNavigation } from 'react-router'

import { paths } from '@/shared/routes'
import { Spinner } from '@/shared/ui'

import styles from './AppLayout.module.css'
import { navigationItems } from './navigation'

export function PageFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner />
    </div>
  )
}

export function AppLayout() {
  const navigation = useNavigation()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={paths.home} className={styles.brand}>
          React Starter
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.session}>
          {navigation.state === 'loading' ? <Spinner label="Loading page" /> : null}
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
