import type { ReactNode } from 'react'

import styles from './Card.module.css'

/**
 * Card atom component
 * Generic card container for content sections
 */
interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>
}

/**
 * Card header sub-component
 */
export const CardHeader = ({ children }: { children: ReactNode }) => {
  return <div className={styles.header}>{children}</div>
}
