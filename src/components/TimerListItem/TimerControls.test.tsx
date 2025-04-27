import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithMantineProvider } from '../../test/test-utils'
import TimerControls from './TimerControls'
import { Timer } from '../../db'

describe('TimerControls', () => {
  const baseTimer: Timer = {
    id: 't-1',
    roundId: 'r-1',
    matchId: null,
    label: 'Test Timer',
    duration: 1000,
    expiresAt: new Date(),
    pausedAt: null,
    createdAt: new Date(),
  }

  let onReset: jest.Mock, onPause: jest.Mock, onUnpause: jest.Mock, onSkipToNextPhase: jest.Mock, onDestroy: jest.Mock
  let confirmSpy: jest.SpyInstance

  beforeEach(() => {
    onReset = jest.fn()
    onPause = jest.fn()
    onUnpause = jest.fn()
    onSkipToNextPhase = jest.fn()
    onDestroy = jest.fn()
    confirmSpy = jest.spyOn(window, 'confirm')
  })

  afterEach(() => {
    jest.clearAllMocks()
    confirmSpy.mockRestore()
  })

  it('renders all control buttons', () => {
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    expect(screen.getByTestId('pause-button')).toBeInTheDocument()
    expect(screen.getByTestId('skip-to-next-phase-button')).toBeInTheDocument()
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('shows Pause button when timer is running', () => {
    // Not paused
    renderWithMantineProvider(
      <TimerControls
        timer={{ ...baseTimer, pausedAt: null }}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    expect(screen.getByTestId('pause-button')).toBeInTheDocument()
    expect(screen.queryByTestId('unpause-button')).not.toBeInTheDocument()
  })

  it('shows Unpause button when timer is paused', () => {
    // Paused
    renderWithMantineProvider(
      <TimerControls
        timer={{ ...baseTimer, pausedAt: new Date() }}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    expect(screen.getByTestId('unpause-button')).toBeInTheDocument()
    expect(screen.queryByTestId('pause-button')).not.toBeInTheDocument()
  })

  it('calls onReset if confirmed', () => {
    confirmSpy.mockReturnValue(true)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('reset-button'))
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to reset this timer?')
    expect(onReset).toHaveBeenCalled()
  })

  it('does not call onReset if not confirmed', () => {
    confirmSpy.mockReturnValue(false)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('reset-button'))
    expect(onReset).not.toHaveBeenCalled()
  })

  it('calls onPause when Pause button is clicked', () => {
    renderWithMantineProvider(
      <TimerControls
        timer={{ ...baseTimer, pausedAt: null }}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('pause-button'))
    expect(onPause).toHaveBeenCalled()
  })

  it('calls onUnpause when Unpause button is clicked', () => {
    renderWithMantineProvider(
      <TimerControls
        timer={{ ...baseTimer, pausedAt: new Date() }}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('unpause-button'))
    expect(onUnpause).toHaveBeenCalled()
  })

  it('calls onSkipToNextPhase if confirmed', () => {
    confirmSpy.mockReturnValue(true)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('skip-to-next-phase-button'))
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to skip this phase?')
    expect(onSkipToNextPhase).toHaveBeenCalled()
  })

  it('does not call onSkipToNextPhase if not confirmed', () => {
    confirmSpy.mockReturnValue(false)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('skip-to-next-phase-button'))
    expect(onSkipToNextPhase).not.toHaveBeenCalled()
  })

  it('calls onDestroy if confirmed', () => {
    confirmSpy.mockReturnValue(true)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this timer?')
    expect(onDestroy).toHaveBeenCalled()
  })

  it('does not call onDestroy if not confirmed', () => {
    confirmSpy.mockReturnValue(false)
    renderWithMantineProvider(
      <TimerControls
        timer={baseTimer}
        onReset={onReset}
        onPause={onPause}
        onUnpause={onUnpause}
        onSkipToNextPhase={onSkipToNextPhase}
        onDestroy={onDestroy}
      />
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(onDestroy).not.toHaveBeenCalled()
  })
})
