import { Button } from '@shared/ui/atoms/Button'
import { Input } from '@shared/ui/atoms/Input'
import { Row, Stack } from '@shared/ui/atoms/Layout'
import { Muted } from '@shared/ui/atoms/Typography'
import type { FormEventHandler, InputHTMLAttributes } from 'react'

interface CreateTodoFormProps {
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  titleError?: string
  titleInputProps: InputHTMLAttributes<HTMLInputElement>
}

export const CreateTodoForm = ({
  isSubmitting,
  onSubmit,
  titleError,
  titleInputProps,
}: CreateTodoFormProps) => {
  return (
    <form aria-label="Create todo form" onSubmit={onSubmit}>
      <Stack>
        <label>
          <span>Title</span>
          <Input type="text" required {...titleInputProps} />
          {titleError ? <Muted>{titleError}</Muted> : null}
        </label>
        <Row>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add todo'}
          </Button>
          <Muted>Protected route backed by in-memory feature state.</Muted>
        </Row>
      </Stack>
    </form>
  )
}
