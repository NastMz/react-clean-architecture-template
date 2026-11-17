import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card } from './Card'

const meta = {
  title: 'Shared/Card',
  component: Card,
  args: {
    eyebrow: 'Workspace',
    title: 'Your todos',
    description: 'Everything you planned for today.',
    children: 'Card content',
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const WithHeader: Story = {}

export const BodyOnly: Story = {
  args: { eyebrow: undefined, title: undefined, description: undefined },
}
