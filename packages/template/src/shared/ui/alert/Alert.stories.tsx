import type { Meta, StoryObj } from '@storybook/react-vite'

import { Alert } from './Alert'

const meta = {
  title: 'Shared/Alert',
  component: Alert,
  args: { children: 'Invalid email or password' },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const ErrorTone: Story = {}

export const InfoTone: Story = {
  args: { tone: 'info', children: 'Demo account: demo@example.com / demo123' },
}
