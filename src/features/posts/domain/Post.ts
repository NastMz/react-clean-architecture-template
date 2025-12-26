/**
 * Post domain entity
 * Pure business logic, independent of external systems
 */
export interface Post {
  id: number
  title: string
  body: string
  userId: number
}
