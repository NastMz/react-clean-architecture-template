import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextField } from './TextField'

const meta = {
  title: 'Shared/TextField',
  component: TextField,
  args: { label: 'Email', placeholder: 'you@example.com' },
} satisfies Meta<typeof TextField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'We never share your email.' } }

export const WithError: Story = { args: { error: 'Enter a valid email address' } }
