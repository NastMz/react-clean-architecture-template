import { z } from 'zod'

/**
 * Zod schema for validating environment variables
 * Ensures type safety and runtime validation of env configuration
 */
const envSchema = z
  .object({
    VITE_API_BASE_URL: z.string().url().optional(),
    VITE_USE_HTTP: z.enum(['true', 'false']).optional(),
  })
  .superRefine((env, context) => {
    if (env.VITE_USE_HTTP === 'true' && !env.VITE_API_BASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VITE_API_BASE_URL'],
        message: 'VITE_API_BASE_URL is required when VITE_USE_HTTP=true',
      })
    }
  })

/**
 * Type-safe environment variables inferred from Zod schema
 */
export type AppEnv = z.infer<typeof envSchema>

export const parseEnv = (env: unknown): AppEnv => envSchema.parse(env)

let cachedEnv: AppEnv | null = null

/**
 * Loads and validates environment variables
 * @throws {ZodError} If environment variables don't match the schema
 * @returns Validated environment variables object
 */
export const loadEnv = (): AppEnv => parseEnv(import.meta.env)

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
