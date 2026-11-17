import type { ReactNode } from 'react'

import styles from './Alert.module.css'

export interface AlertProps {
  tone?: 'error' | 'info'
  children: ReactNode
}

export function Alert({ tone = 'error', children }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`${styles.alert} ${styles[tone]}`}>
      {children}
    </div>
  )
}
