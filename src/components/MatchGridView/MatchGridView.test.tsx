import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import matchUpdate from '../../db/match/match-update'
import { buildMatch } from '../../test/db/match-factory'
import { buildPlayer } from '../../test/db/player-factory'
import { buildRound } from '../../test/db/round-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import MatchGridView from './MatchGridView'

jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn(),
}))

jest.mock('../../db/match/match-update', () => jest.fn())

import * as dexieReactHooks from 'dexie-react-hooks'
const useLiveQuery = dexieReactHooks.useLiveQuery as jest.Mock

describe('MatchGridView', () => {
  const player1 = buildPlayer({ id: 'p1', name: 'Alice' })
  const player2 = buildPlayer({ id: 'p2', name: 'Bob' })
  const player3 = buildPlayer({ id: 'p3', name: 'Charlie' })
  const round = buildRound()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loader when matches are not loaded', () => {
    useLiveQuery.mockReturnValue(undefined)
    renderWithMantineProvider(<MatchGridView round={round} players={[player1, player2]} />)
    expect(screen.getByTestId('match-grid-view-loader')).toBeInTheDocument()
  })

  it('renders a MatchCard for each match', () => {
    const matches = [
      buildMatch({ id: 'm1', playerIds: [player1.id, player2.id] }),
      buildMatch({ id: 'm2', playerIds: [player3.id, null] }),
    ]
    useLiveQuery.mockReturnValue(matches)
    renderWithMantineProvider(<MatchGridView round={round} players={[player1, player2, player3]} />)
    // Both player names and BYE should be present
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('BYE')).toBeInTheDocument()
  })

  it('calls matchUpdate with correct args when winner is selected', () => {
    const matches = [buildMatch({ id: 'm1', playerIds: [player1.id, player2.id] })]
    useLiveQuery.mockReturnValue(matches)
    renderWithMantineProvider(<MatchGridView round={round} players={[player1, player2]} />)
    // Click Alice as winner
    fireEvent.click(screen.getByTestId(`match-card-player-${player1.id}`))
    expect(matchUpdate).toHaveBeenCalledWith('m1', { winnerId: player1.id, isDraw: false })
    // Click Bob as winner
    fireEvent.click(screen.getByTestId(`match-card-player-${player2.id}`))
    expect(matchUpdate).toHaveBeenCalledWith('m1', { winnerId: player2.id, isDraw: false })
  })

  it('calls matchUpdate with correct args when draw is set', () => {
    const matches = [buildMatch({ id: 'm1', playerIds: [player1.id, player2.id] })]
    useLiveQuery.mockReturnValue(matches)
    renderWithMantineProvider(<MatchGridView round={round} players={[player1, player2]} />)
    fireEvent.click(screen.getByTestId('match-card-divider-m1'))
    expect(matchUpdate).toHaveBeenCalledWith('m1', { winnerId: null, isDraw: true })
  })
})
