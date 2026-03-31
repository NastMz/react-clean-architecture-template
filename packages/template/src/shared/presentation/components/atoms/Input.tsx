import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import styles from './Input.module.css'

/**
 * Input atom component
 * Reusable text input field
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    return <input ref={ref} className={styles.textField} {...props} />
  },
)
