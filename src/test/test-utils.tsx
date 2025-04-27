import { MantineProvider } from '@mantine/core'
import { render, RenderOptions } from '@testing-library/react'
import React from 'react'

export function renderWithMantineProvider(ui: React.ReactElement, options?: RenderOptions) {
  return render(<MantineProvider>{ui}</MantineProvider>, options)
}
