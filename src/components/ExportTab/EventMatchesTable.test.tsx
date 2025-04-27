import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { buildEvent } from '../../test/db/event-factory'
import { buildPlayer } from '../../test/db/player-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import EventMatchesTable from './EventMatchesTable'

jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn(),
}))

const mockUseLiveQuery = require('dexie-react-hooks').useLiveQuery

describe('EventMatchesTable', () => {
  const event = buildEvent()
  const player1 = buildPlayer({ id: '1', name: 'Alice', wins: 2, losses: 1, draws: 0 })
  const player2 = buildPlayer({ id: '2', name: 'Bob', wins: 1, losses: 2, draws: 0 })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders message when no rounds', () => {
    mockUseLiveQuery
      .mockReturnValueOnce([player1, player2]) // players
      .mockReturnValueOnce(null) // currentRound
    renderWithMantineProvider(<EventMatchesTable event={event} />)
    expect(screen.getByText('No rounds have been played yet')).toBeInTheDocument()
  })

  it('renders message when no matches', () => {
    mockUseLiveQuery
      .mockReturnValueOnce([player1, player2]) // players
      .mockReturnValueOnce({ id: 'round-1' }) // currentRound
      .mockReturnValueOnce(null) // matches
    renderWithMantineProvider(<EventMatchesTable event={event} />)
    expect(screen.getByText('No matches for current round')).toBeInTheDocument()
  })

  it('renders table rows for matches', () => {
    const match = { id: 'match-1', table: 1, playerIds: ['1', '2'] }
    mockUseLiveQuery
      .mockReturnValueOnce([player1, player2]) // players
      .mockReturnValueOnce({ id: 'round-1' }) // currentRound
      .mockReturnValueOnce([match]) // matches
    renderWithMantineProvider(<EventMatchesTable event={event} />)
    expect(screen.getByText('Table #1')).toBeInTheDocument()
    expect(screen.getByText('Alice [2, 1, 0]')).toBeInTheDocument()
    expect(screen.getByText('Bob [1, 2, 0]')).toBeInTheDocument()
  })

  it('copy button copies table text and shows correct icon/text', async () => {
    const match = { id: 'match-1', table: 1, playerIds: ['1', '2'] }
    const copy = jest.fn()
    mockUseLiveQuery
      .mockReturnValueOnce([player1, player2]) // players
      .mockReturnValueOnce({ id: 'round-1' }) // currentRound
      .mockReturnValueOnce([match]) // matches
    jest.spyOn(require('@mantine/hooks'), 'useClipboard').mockReturnValue({ copy, copied: false })
    renderWithMantineProvider(<EventMatchesTable event={event} />)
    const button = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(button)
    expect(copy).toHaveBeenCalled()
  })
})
