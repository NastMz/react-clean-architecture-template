import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './Button'

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: 'Save changes' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } }

export const Small: Story = { args: { size: 'sm' } }

export const Disabled: Story = { args: { disabled: true } }
