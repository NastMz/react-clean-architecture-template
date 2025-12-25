import { z } from 'zod'

/**
 * Zod schema for validating environment variables
 * Ensures type safety and runtime validation of env configuration
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
})

/**
 * Type-safe environment variables inferred from Zod schema
 */
export type AppEnv = z.infer<typeof envSchema>

/**
 * Loads and validates environment variables
 * @throws {ZodError} If environment variables don't match the schema
 * @returns Validated environment variables object
 */
export const loadEnv = (): AppEnv => envSchema.parse(import.meta.env)
