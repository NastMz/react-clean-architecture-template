import type { ReactNode } from 'react'

import styles from './SessionCard.module.css'

/**
 * SessionCard molecule component
 * Displays user session information
 */
interface SessionCardProps {
  children: ReactNode
}

export const SessionCard = ({ children }: SessionCardProps) => (
  <div className={styles.sessionCard}>{children}</div>
)
