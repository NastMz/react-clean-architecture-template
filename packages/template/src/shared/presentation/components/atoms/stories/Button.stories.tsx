import { Button } from '@shared/presentation/components/atoms/Button'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Loading...',
    disabled: true,
  },
}
