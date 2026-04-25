import { Button } from '@shared/ui/atoms/Button'
import { Eyebrow, Muted, Title } from '@shared/ui/atoms/Typography'

import styles from './AuthenticatedSessionPanel.module.css'

interface AuthenticatedSessionPanelProps {
  email: string
  isLoggingOut: boolean
  name: string
  onLogout: () => void
}

export const AuthenticatedSessionPanel = ({
  email,
  isLoggingOut,
  name,
  onLogout,
}: AuthenticatedSessionPanelProps) => {
  return (
    <section className={styles.sessionPanel} role="region" aria-label="Authenticated session panel">
      <Eyebrow>Logged in</Eyebrow>
      <Title>{name}</Title>
      <Muted>{email}</Muted>
      <Button variant="ghost" onClick={onLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'Closing session…' : 'Logout'}
      </Button>
    </section>
  )
}
