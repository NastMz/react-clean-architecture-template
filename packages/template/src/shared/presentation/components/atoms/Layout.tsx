import styles from './Layout.module.css'

/**
 * Layout atom component
 * Provides app shell structure
 */

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.appShell}>{children}</div>
)

export const AppHeader = ({ children }: { children: React.ReactNode }) => (
  <header className={styles.appHeader}>{children}</header>
)

export const Brand = ({ children }: { children: string }) => (
  <div className={styles.brand}>{children}</div>
)

export const AppNav = ({ children }: { children: React.ReactNode }) => (
  <nav className={styles.appNav}>{children}</nav>
)

export const AppMain = ({ children }: { children: React.ReactNode }) => (
  <main className={styles.appMain}>{children}</main>
)

export const NavLink = ({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
  <a className={`${styles.navLink} ${className ?? ''}`} {...props}>
    {children}
  </a>
)

export const Stack = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.stack}>{children}</div>
)

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.row}>{children}</div>
)
