import type { ReactNode } from 'react'

import styles from './Typography.module.css'

/**
 * Typography utility components
 */

export const Eyebrow = ({ children }: { children: string }) => (
  <p className={styles.eyebrow}>{children}</p>
)

export const Muted = ({ children }: { children: string | ReactNode }) => (
  <p className={styles.muted}>{children}</p>
)

export const Title = ({ children }: { children: string | ReactNode }) => (
  <p className={styles.title}>{children}</p>
)

export const Alert = ({ children }: { children: string | ReactNode }) => (
  <div className={styles.alert}>{children}</div>
)
