import { AuthPage } from '@features/auth/ui/AuthPage'
import { PostsPage } from '@features/posts/ui/PostsPage'
import { TodoPage } from '@features/todo/ui/TodoPage'
import { RootLayout } from '@shared/presentation/components/Layout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'

/**
 * Application router configuration
 * Defines template routes for the starter app
 *
 * Route structure:
 * - / : Root layout wrapper for all routes
 *   - /auth : Public login/logout page (no protection)
 *   - /todos : Protected todo management feature
 *   - /posts : Protected posts browsing feature
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/auth" replace /> },
      { path: '/auth', element: <AuthPage /> },
      {
        path: '/todos',
        element: <ProtectedRoute element={<TodoPage />} />,
      },
      {
        path: '/posts',
        element: <ProtectedRoute element={<PostsPage />} />,
      },
    ],
  },
])

/**
 * Router provider component
 * Sets up React Router for application navigation
 */
export const AppRouter = () => <RouterProvider router={router} />
