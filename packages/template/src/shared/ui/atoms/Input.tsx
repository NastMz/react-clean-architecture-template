import type { InputHTMLAttributes, Ref } from 'react'

import styles from './Input.module.css'

/**
 * Input atom component
 * Reusable text input field
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

export const Input = ({ ref, ...props }: InputProps) => {
  return <input ref={ref} className={styles.textField} {...props} />
}
