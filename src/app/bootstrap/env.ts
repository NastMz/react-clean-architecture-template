import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
})

export type AppEnv = z.infer<typeof envSchema>

export const loadEnv = (): AppEnv => envSchema.parse(import.meta.env)
