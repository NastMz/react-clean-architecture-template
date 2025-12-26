import { Card, CardHeader } from '@shared/presentation/components/atoms/Card'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Card style={{ width: '400px' }}>
      <CardHeader>
        <h2>Card Title</h2>
      </CardHeader>
      <p>This is the card content. You can put any content here.</p>
    </Card>
  ),
}

export const WithContent: Story = {
  render: () => (
    <Card style={{ width: '400px' }}>
      <CardHeader>
        <h3>User Profile</h3>
      </CardHeader>
      <div style={{ padding: '1rem' }}>
        <p>
          <strong>Name:</strong> John Doe
        </p>
        <p>
          <strong>Email:</strong> john@example.com
        </p>
        <p>
          <strong>Role:</strong> Developer
        </p>
      </div>
    </Card>
  ),
}

export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <Card>
        <CardHeader>
          <h3>Card 1</h3>
        </CardHeader>
        <p style={{ padding: '1rem' }}>Content for card 1</p>
      </Card>
      <Card>
        <CardHeader>
          <h3>Card 2</h3>
        </CardHeader>
        <p style={{ padding: '1rem' }}>Content for card 2</p>
      </Card>
    </div>
  ),
}
