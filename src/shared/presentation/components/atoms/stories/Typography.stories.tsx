import type { Meta, StoryObj } from '@storybook/react'

import { Alert, Eyebrow, Muted, Title } from '../Typography'

const meta = {
  title: 'Atoms/Typography',
  component: Title,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Title>

export default meta
type Story = StoryObj<typeof meta>

export const TitleComponent: Story = {
  render: () => <Title>This is a Title</Title>,
}

export const EyebrowComponent: Story = {
  render: () => <Eyebrow>THIS IS AN EYEBROW</Eyebrow>,
}

export const MutedComponent: Story = {
  render: () => <Muted>This text is muted and less prominent</Muted>,
}

export const AlertComponent: Story = {
  render: () => <Alert>This is an alert message</Alert>,
}

export const TypographyComposition: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <Eyebrow>SECTION LABEL</Eyebrow>
      <Title>Main Heading</Title>
      <p>This is regular paragraph text.</p>
      <Muted>This is supplementary information in muted style</Muted>
    </div>
  ),
}

export const AllTypography: Story = {
  render: () => (
    <div
      style={{
        padding: '2rem',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div>
        <h3>Title</h3>
        <Title>This is a Title Component</Title>
      </div>
      <div>
        <h3>Eyebrow</h3>
        <Eyebrow>EYEBROW TEXT</Eyebrow>
      </div>
      <div>
        <h3>Muted</h3>
        <Muted>This is muted text</Muted>
      </div>
      <div>
        <h3>Alert</h3>
        <Alert>This is an alert notification</Alert>
      </div>
    </div>
  ),
}
