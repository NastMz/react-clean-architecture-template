import type { AppEnv } from './env'

/**
 * Application configuration interface
 * Defines settings for the application including API endpoints and feature flags
 */
export interface AppConfig {
  apiBaseUrl: string
  featureFlags: Record<string, never>
}

/**
 * Creates application configuration from environment variables
 * @param env - Environment variables loaded and validated from Zod schema
 * @returns Application configuration object with API settings and feature flags
 */
export const createAppConfig = (env: AppEnv): AppConfig => ({
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'https://api.example.com',
  featureFlags: {},
})
