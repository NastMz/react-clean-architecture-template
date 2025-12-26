import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { Button } from '@shared/presentation/components/atoms/Button'
import { Card, CardHeader } from '@shared/presentation/components/atoms/Card'
import { Stack } from '@shared/presentation/components/atoms/Layout'
import { Alert, Eyebrow, Muted, Title } from '@shared/presentation/components/atoms/Typography'
import { useQuery as useQueryFn } from '@tanstack/react-query'
import { useState } from 'react'

import type { Post } from '../domain/Post'

/**
 * Posts page demonstrating HttpClient usage
 * Fetches data from external API and displays posts
 * Shows how to integrate API calls with React Query
 */
export const PostsPage = () => {
  const { adapters } = useContainer()
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const postsQuery = useQueryFn(adapters.posts.queries.list())

  const selectedPostQuery = useQueryFn(
    selectedPostId ? adapters.posts.queries.detail(selectedPostId) : { enabled: false },
  )

  const handleSelectPost = (id: number) => {
    setSelectedPostId(id)
  }

  const handleClear = () => {
    setSelectedPostId(null)
  }

  return (
    <Stack>
      <Card>
        <CardHeader>
          <div>
            <Eyebrow>Posts feature</Eyebrow>
            <h2>External API integration demo</h2>
            <Muted>
              Demonstrates HttpClient usage fetching from JSONPlaceholder API. Shows adapter pattern
              for API integration.
            </Muted>
          </div>
        </CardHeader>

        {postsQuery.isError ? <Alert>{formatAppError(postsQuery.error)}</Alert> : null}

        {postsQuery.isLoading ? (
          <Muted>Loading posts…</Muted>
        ) : (
          <div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                gap: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {}
              {postsQuery.data?.map((post: Post) => (
                <li
                  key={post.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: selectedPostId === post.id ? '#f3f4f6' : 'transparent',
                  }}
                  onClick={() => handleSelectPost(post.id)}
                >
                  <strong>{post.title}</strong>
                  <Muted>{post.body.substring(0, 100)}…</Muted>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {selectedPostId && (
        <Card>
          <CardHeader>
            <Title>Post Details</Title>
          </CardHeader>

          {selectedPostQuery.isError ? (
            <Alert>{formatAppError(selectedPostQuery.error)}</Alert>
          ) : null}

          {selectedPostQuery.isLoading ? (
            <Muted>Loading…</Muted>
          ) : selectedPostQuery.data ? (
            <Stack>
              <div>
                <Eyebrow>ID: {selectedPostQuery.data.id}</Eyebrow>
                <Title>{selectedPostQuery.data.title}</Title>
                <p style={{ margin: '1rem 0' }}>{selectedPostQuery.data.body}</p>
                <Muted>By User #{selectedPostQuery.data.userId}</Muted>
              </div>
              <Button onClick={handleClear} variant="ghost">
                Close
              </Button>
            </Stack>
          ) : null}
        </Card>
      )}
    </Stack>
  )
}
