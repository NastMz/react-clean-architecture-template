import type { Meta } from '@storybook/react'

const meta = {
  title: 'Documentation/Introduction',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta

export const Welcome = {
  render: () => (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1>Welcome to Clean Architecture Component Library</h1>

      <h2>Overview</h2>
      <p>
        This Storybook showcases the atomic design components and features built with Clean
        Architecture principles in React.
      </p>

      <h2>Structure</h2>
      <ul>
        <li>
          <strong>Atoms:</strong> Basic building blocks like Button, Input, Card, Typography
        </li>
        <li>
          <strong>Features:</strong> Complete features demonstrating full Clean Architecture layers
        </li>
        <li>
          <strong>Documentation:</strong> Guides and patterns
        </li>
      </ul>

      <h2>Key Principles</h2>
      <ul>
        <li>
          <strong>Atomic Design:</strong> Components are organized by size and complexity
        </li>
        <li>
          <strong>Clean Architecture:</strong> Separation of concerns across Domain, Application,
          Infrastructure, Adapters, and UI
        </li>
        <li>
          <strong>Type Safety:</strong> Full TypeScript support with strict type checking
        </li>
        <li>
          <strong>Testability:</strong> Components are isolated and easy to test
        </li>
      </ul>

      <h2>Getting Started</h2>
      <ol>
        <li>Browse the sidebar to explore atomic components</li>
        <li>Check out the Features section for complete example implementations</li>
        <li>Read the documentation for patterns and best practices</li>
      </ol>

      <h2>Architecture Example: Posts Feature</h2>
      <p>
        The Posts feature demonstrates proper HttpClient usage within Clean Architecture. It shows:
      </p>
      <ul>
        <li>
          <strong>Domain Layer:</strong> Post entity interface
        </li>
        <li>
          <strong>Application Layer:</strong> PostRepository port and postUseCases orchestration
        </li>
        <li>
          <strong>Infrastructure Layer:</strong> httpPostRepository using HttpClient to fetch from
          JSONPlaceholder API
        </li>
        <li>
          <strong>Adapter Layer:</strong> postAdapters converting Result&lt;T, E&gt; to React Query
          format
        </li>
        <li>
          <strong>UI Layer:</strong> PostsPage component using custom hooks for clean separation
        </li>
      </ul>

      <h2>Key Features</h2>
      <ul>
        <li>✅ Type-safe Result&lt;T, E&gt; monad for error handling</li>
        <li>✅ No linter disabling needed</li>
        <li>✅ React Query integration for server state management</li>
        <li>✅ Responsive layout with scrollable lists and details panel</li>
        <li>✅ Clean API through custom hooks</li>
      </ul>

      <h2>Resources</h2>
      <ul>
        <li>
          <a href="https://storybook.js.org" target="_blank" rel="noopener noreferrer">
            Storybook Documentation
          </a>
        </li>
        <li>
          <a
            href="https://bradfrost.com/blog/post/atomic-web-design/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Atomic Design Methodology
          </a>
        </li>
        <li>
          <a
            href="https://github.com/bespoyasov/clean-architecture"
            target="_blank"
            rel="noopener noreferrer"
          >
            Clean Architecture Reference
          </a>
        </li>
      </ul>
    </div>
  ),
}
