import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { Timer } from '../../db'
import { buildTimer } from '../../test/db/timer-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import TimerListItem from './TimerListItem'

jest.mock('../../hooks/use-timer')
jest.mock('../../db/timer/timer-update')

import * as timerUpdateModule from '../../db/timer/timer-update'
const timerUpdate = timerUpdateModule.default as jest.Mock

import * as useTimerModule from '../../hooks/use-timer'
const useTimer = useTimerModule.default as jest.Mock

describe('TimerListItem', () => {
  const timer: Timer = buildTimer({ label: 'Test Timer' })
  const mockPhase = { name: 'Phase 1', colour: 123 }
  const mockCallbacks = {
    pause: jest.fn(),
    unpause: jest.fn(),
    skipToNextPhase: jest.fn(),
    reset: jest.fn(),
    destroy: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useTimer.mockReturnValue({
      phase: mockPhase,
      hours: 1,
      minutes: 2,
      seconds: 3,
      ...mockCallbacks,
    })
  })

  it('renders phase name and formatted time', () => {
    renderWithMantineProvider(<TimerListItem timer={timer} />)
    expect(screen.getByText('Phase 1')).toBeInTheDocument()
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
  })

  it('renders timer label if phase name is missing', () => {
    useTimer.mockReturnValue({
      phase: undefined,
      hours: 0,
      minutes: 5,
      seconds: 7,
      ...mockCallbacks,
    })
    renderWithMantineProvider(<TimerListItem timer={timer} />)
    expect(screen.getByText('Test Timer')).toBeInTheDocument()
    expect(screen.getByText('05:07')).toBeInTheDocument()
  })

  it('renders text input with timer label as default value', () => {
    renderWithMantineProvider(<TimerListItem timer={timer} />)
    const input = screen.getByDisplayValue('Test Timer')
    expect(input).toBeInTheDocument()
  })

  it('calls timerUpdate on blur with new value', () => {
    renderWithMantineProvider(<TimerListItem timer={timer} />)
    const input = screen.getByDisplayValue('Test Timer')
    fireEvent.change(input, { target: { value: 'New Label' } })
    fireEvent.blur(input)
    expect(timerUpdate).toHaveBeenCalledWith(timer.id, { label: 'New Label' })
  })

  it('renders TimerControls and passes correct props', () => {
    renderWithMantineProvider(<TimerListItem timer={timer} />)
    // The TimerControls buttons should be present
    expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    expect(screen.getByTestId('pause-button')).toBeInTheDocument()
    expect(screen.getByTestId('skip-to-next-phase-button')).toBeInTheDocument()
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('passes muted prop to useTimer', () => {
    renderWithMantineProvider(<TimerListItem timer={timer} muted />)
    expect(useTimer.mock.calls[0][1]).toEqual({ muted: true })
  })
})
