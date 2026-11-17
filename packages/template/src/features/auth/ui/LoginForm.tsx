import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { type Credentials, credentialsSchema, type User } from '@/entities/session'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, TextField } from '@/shared/ui'

import { useLogin } from '../model/useLogin'
import styles from './LoginForm.module.css'

export interface LoginFormProps {
  onSuccess?: (user: User) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit((credentials) => {
    loginMutation.mutate(credentials, { onSuccess })
  })

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      {loginMutation.isError ? <Alert>{getErrorMessage(loginMutation.error)}</Alert> : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
