import type { InputHTMLAttributes } from 'react'

import styles from './Input.module.css'

/**
 * Input atom component
 * Reusable text input field
 */
export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return <input className={styles.textField} {...props} />
}
