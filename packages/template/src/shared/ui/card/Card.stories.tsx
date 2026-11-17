import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card } from './Card'

const meta = {
  title: 'Shared/Card',
  component: Card,
  args: {
    eyebrow: 'Account',
    title: 'Profile',
    description: 'Manage how others see you.',
    children: 'Card content',
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const WithHeader: Story = {}

export const BodyOnly: Story = {
  args: { eyebrow: undefined, title: undefined, description: undefined },
}
