import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { buildEvent } from '../../test/db/event-factory'
import { buildPlayer } from '../../test/db/player-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import EventStandingsTable from './EventStandingsTable'

jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn(),
}))

const mockUseLiveQuery = require('dexie-react-hooks').useLiveQuery

describe('EventStandingsTable', () => {
  const event = buildEvent({ playersCount: 2 })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders message when no players', () => {
    mockUseLiveQuery.mockReturnValue(undefined)
    renderWithMantineProvider(<EventStandingsTable event={event} />)
    expect(screen.getByText('No players have been added yet')).toBeInTheDocument()
  })

  it('renders table rows for players', () => {
    const players = [
      buildPlayer({ id: '1', name: 'Alice', wins: 2, losses: 1, draws: 0, score: 6, opponentWinRate: 0.75 }),
      buildPlayer({ id: '2', name: 'Bob', wins: 1, losses: 2, draws: 0, score: 3, opponentWinRate: 0.5 }),
    ]
    mockUseLiveQuery.mockReturnValue(players)
    renderWithMantineProvider(<EventStandingsTable event={event} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('[2, 1, 0]')).toBeInTheDocument()
    expect(screen.getByText('6 pts')).toBeInTheDocument()
    expect(screen.getByText('0.7500%')).toBeInTheDocument()
  })

  it('copy button copies table text and shows correct icon/text', async () => {
    const players = [
      buildPlayer({ id: '1', name: 'Alice', wins: 2, losses: 1, draws: 0, score: 6, opponentWinRate: 0.75 }),
    ]
    const copy = jest.fn()
    mockUseLiveQuery.mockReturnValue(players)
    jest.spyOn(require('@mantine/hooks'), 'useClipboard').mockReturnValue({ copy, copied: false })
    renderWithMantineProvider(<EventStandingsTable event={event} />)
    const button = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(button)
    expect(copy).toHaveBeenCalled()
  })
})
