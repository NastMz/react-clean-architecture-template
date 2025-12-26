import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Input } from '../Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number...',
  },
}

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'This is disabled',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    type: 'text',
    value: 'Pre-filled value',
  },
}

function InteractiveInput() {
  const [value, setValue] = useState('')
  return (
    <Input
      type="text"
      placeholder="Type something..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export const Interactive: Story = {
  render: () => <InteractiveInput />,
}
