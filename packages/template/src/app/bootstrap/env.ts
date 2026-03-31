import { z } from 'zod'

/**
 * Zod schema for validating environment variables
 * Ensures type safety and runtime validation of env configuration
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_USE_HTTP: z.enum(['true', 'false']).optional(),
})

/**
 * Type-safe environment variables inferred from Zod schema
 */
export type AppEnv = z.infer<typeof envSchema>

let cachedEnv: AppEnv | null = null

/**
 * Loads and validates environment variables
 * @throws {ZodError} If environment variables don't match the schema
 * @returns Validated environment variables object
 */
export const loadEnv = (): AppEnv => envSchema.parse(import.meta.env)

/**
 * Singleton accessor for env (validated once).
 * In dev HMR, you still need to restart Vite when changing .env files.
 */
export const getEnv = (): AppEnv => {
  if (cachedEnv) return cachedEnv
  cachedEnv = loadEnv()
  return cachedEnv
}

// Optional: reset cache on HMR to allow recomputation (still requires dev server restart for new .env files)
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cachedEnv = null
  })
}
