import { useNavigate } from 'react-router'

import { paths } from '@/shared/routes'
import { Button } from '@/shared/ui'

import { useLogout } from '../model/useLogout'

export function LogoutButton() {
  const navigate = useNavigate()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        void navigate(paths.login, { replace: true })
      },
    })
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
