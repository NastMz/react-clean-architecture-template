import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.css'

const BUTTON_VARIANT = {
  GHOST: 'ghost',
  PRIMARY: 'primary',
  SUBTLE: 'subtle',
} as const

const BUTTON_SIZE = {
  DEFAULT: 'default',
  ICON: 'icon',
} as const

type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT]
type ButtonSize = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE]

/**
 * Button atom component
 * Reusable button with sober variants for product-like flows.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

export const Button = ({
  variant = BUTTON_VARIANT.PRIMARY,
  size = BUTTON_SIZE.DEFAULT,
  className,
  ...props
}: ButtonProps) => {
  const variantClass = styles[variant]
  const sizeClass = size === BUTTON_SIZE.ICON ? styles.icon : styles.default

  return (
    <button
      className={`${styles.btn} ${variantClass} ${sizeClass} ${className ?? ''}`}
      {...props}
    />
  )
}
