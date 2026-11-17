import type { ReactNode } from 'react'

import styles from './Card.module.css'

export interface CardProps {
  title?: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function Card({ title, eyebrow, description, actions, children, className }: CardProps) {
  const hasHeader = Boolean(title ?? eyebrow ?? description ?? actions)

  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {hasHeader ? (
        <header className={styles.header}>
          <div>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h1 className={styles.title}>{title}</h1> : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
