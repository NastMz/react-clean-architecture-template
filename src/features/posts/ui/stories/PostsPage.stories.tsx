import type { Meta, StoryObj } from '@storybook/react'

import { PostsPage } from '../PostsPage'

const meta = {
  title: 'Features/Posts',
  component: PostsPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PostsPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Posts feature demonstrates HttpClient integration with Clean Architecture.
 *
 * Shows:
 * - Domain: Post entity interface
 * - Application: PostRepository port and postUseCases orchestration
 * - Infrastructure: httpPostRepository using HttpClient to fetch from JSONPlaceholder API
 * - Adapters: postAdapters converting Result<T, E> to React Query format
 * - UI: PostsPage component using custom hooks for clean separation
 */
export const Default: Story = {
  render: () => <PostsPage />,
}
