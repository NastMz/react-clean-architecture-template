import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

import styles from './Layout.module.css'

/**
 * Layout atom component
 * Provides app shell structure
 */

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className={styles.appShell}>{children}</div>
)

export const AppHeader = ({ children }: { children: ReactNode }) => (
  <header className={styles.appHeader}>{children}</header>
)

export const Brand = ({ children }: { children: string }) => (
  <div className={styles.brand}>{children}</div>
)

export const AppNav = ({ children }: { children: ReactNode }) => (
  <nav className={styles.appNav}>{children}</nav>
)

export const AppMain = ({ children }: { children: ReactNode }) => (
  <main className={styles.appMain}>{children}</main>
)

export const NavLink = ({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
  <a className={`${styles.navLink} ${className ?? ''}`} {...props}>
    {children}
  </a>
)

type DivProps = HTMLAttributes<HTMLDivElement>

export const Stack = ({ children, className, ...props }: DivProps) => (
  <div className={`${styles.stack} ${className ?? ''}`} {...props}>
    {children}
  </div>
)

export const Row = ({ children, className, ...props }: DivProps) => (
  <div className={`${styles.row} ${className ?? ''}`} {...props}>
    {children}
  </div>
)
