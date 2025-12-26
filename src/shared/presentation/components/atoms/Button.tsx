import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.css'

/**
 * Button atom component
 * Reusable button with variant support (primary, ghost)
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const variantClass = variant === 'ghost' ? styles.ghost : styles.primary
  return <button className={`${styles.btn} ${variantClass} ${className ?? ''}`} {...props} />
}
