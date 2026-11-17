import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
})

export type User = z.infer<typeof userSchema>

export const credentialsSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type Credentials = z.infer<typeof credentialsSchema>

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
})
