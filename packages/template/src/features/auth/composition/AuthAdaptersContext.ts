import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import { createContext } from 'react'

export const AuthAdaptersContext = createContext<AuthAdapters | null>(null)
