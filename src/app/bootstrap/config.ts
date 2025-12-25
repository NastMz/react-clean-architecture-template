import type { AppEnv } from './env'

export interface AppConfig {
  apiBaseUrl: string
  featureFlags: {
    enablePlaywrightScaffold: boolean
  }
}

export const createAppConfig = (env: AppEnv): AppConfig => ({
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'https://api.example.com',
  featureFlags: {
    enablePlaywrightScaffold: false,
  },
})
