import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().trim().min(1).default('/api'),
  VITE_API_MOCKING: z.enum(['enabled', 'disabled']).optional(),
  DEV: z.boolean().default(false),
})

export interface AppEnv {
  /** Base URL of the backend API, without a trailing slash. */
  apiUrl: string
  /** Whether the MSW mock backend serves API requests in the browser. */
  apiMocking: 'enabled' | 'disabled'
}

/**
 * Validates raw Vite env variables once, at startup, so a misconfigured
 * deployment fails loudly instead of at the first request.
 */
export const parseEnv = (raw: Record<string, unknown>): AppEnv => {
  const parsed = envSchema.parse(raw)

  return {
    apiUrl: parsed.VITE_API_URL.replace(/\/+$/, ''),
    apiMocking: parsed.VITE_API_MOCKING ?? (parsed.DEV ? 'enabled' : 'disabled'),
  }
}

export const env: AppEnv = parseEnv(import.meta.env)
