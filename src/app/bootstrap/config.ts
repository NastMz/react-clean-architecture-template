import type { AppEnv } from './env'
import { getEnv } from './env'

/**
 * Application configuration interface
 * Defines settings for the application including API endpoints and feature flags
 */
export interface AppConfig {
  apiBaseUrl: string
  useHttp: boolean
  featureFlags: Record<string, never>
}

/**
 * Creates application configuration from environment variables
 * @param env - Environment variables loaded and validated from Zod schema
 * @returns Application configuration object with API settings and feature flags
 */
export const createAppConfig = (env: AppEnv): AppConfig => ({
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'https://api.example.com',
  useHttp: env.VITE_USE_HTTP === 'true',
  featureFlags: {},
})

let cachedConfig: AppConfig | null = null

/**
 * Singleton accessor for app config (built from validated env).
 */
export const getConfig = (): AppConfig => {
  if (cachedConfig) return cachedConfig
  cachedConfig = createAppConfig(getEnv())
  return cachedConfig
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cachedConfig = null
  })
}
