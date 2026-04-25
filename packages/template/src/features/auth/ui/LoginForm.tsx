import { Button } from '@shared/ui/atoms/Button'
import { Input } from '@shared/ui/atoms/Input'
import { Row, Stack } from '@shared/ui/atoms/Layout'
import { Muted } from '@shared/ui/atoms/Typography'
import type { FormEventHandler, InputHTMLAttributes } from 'react'

interface LoginFormProps {
  emailError?: string
  emailInputProps: InputHTMLAttributes<HTMLInputElement>
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  passwordError?: string
  passwordInputProps: InputHTMLAttributes<HTMLInputElement>
}

export const LoginForm = ({
  emailError,
  emailInputProps,
  isSubmitting,
  onSubmit,
  passwordError,
  passwordInputProps,
}: LoginFormProps) => {
  return (
    <form aria-label="Auth login form" onSubmit={onSubmit}>
      <Stack>
        <label>
          <span>Email</span>
          <Input type="email" required {...emailInputProps} />
          {emailError ? <Muted>{emailError}</Muted> : null}
        </label>
        <label>
          <span>Password</span>
          <Input type="password" required {...passwordInputProps} />
          {passwordError ? <Muted>{passwordError}</Muted> : null}
        </label>
        <Row>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Login'}
          </Button>
          <Muted>Use demo@example.com / demo123</Muted>
        </Row>
      </Stack>
    </form>
  )
}
