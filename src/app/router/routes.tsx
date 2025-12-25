import { AuthPage } from '@features/auth/ui/AuthPage'
import { TodoPage } from '@features/todo/ui/TodoPage'
import { RootLayout } from '@shared/presentation/components/Layout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/auth" replace /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/todos', element: <TodoPage /> },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
