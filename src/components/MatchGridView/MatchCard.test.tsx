import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithMantineProvider } from '../../test/test-utils'
import { buildPlayer } from '../../test/db/player-factory'
import { buildMatch } from '../../test/db/match-factory'
import MatchCard from './MatchCard'

describe('MatchCard', () => {
  const player1 = buildPlayer({ id: 'p1', name: 'Alice' })
  const player2 = buildPlayer({ id: 'p2', name: 'Bob' })

  it('renders table number and both player names', () => {
    const match = buildMatch({ table: 3, playerIds: [player1.id, player2.id], isDraw: false })
    renderWithMantineProvider(
      <MatchCard match={match} player1={player1} player2={player2} onSelectWinner={jest.fn()} onSetDraw={jest.fn()} />
    )
    expect(screen.getByText('Table 3')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('TIE')).toBeInTheDocument()
  })

  it('renders only player1 and blank space when player2 is null', () => {
    const match = buildMatch({ table: 1, playerIds: [player1.id, null], isDraw: false })
    renderWithMantineProvider(
      <MatchCard match={match} player1={player1} player2={null} onSelectWinner={jest.fn()} onSetDraw={jest.fn()} />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('BYE')).toBeInTheDocument()
    expect(screen.getByText('No player 2')).toBeInTheDocument()
  })

  it('calls onSelectWinner with correct player', () => {
    const match = buildMatch({ playerIds: [player1.id, player2.id], isDraw: false })
    const onSelectWinner = jest.fn()
    renderWithMantineProvider(
      <MatchCard
        match={match}
        player1={player1}
        player2={player2}
        onSelectWinner={onSelectWinner}
        onSetDraw={jest.fn()}
      />
    )
    // Click Alice
    fireEvent.click(screen.getByTestId(`match-card-player-${match.id}-${player1.id}`))
    expect(onSelectWinner).toHaveBeenCalledWith(player1)
    // Click Bob
    fireEvent.click(screen.getByTestId(`match-card-player-${match.id}-${player2.id}`))
    expect(onSelectWinner).toHaveBeenCalledWith(player2)
  })

  it('calls onSetDraw when divider is clicked (not a bye)', () => {
    const match = buildMatch({ playerIds: [player1.id, player2.id], isDraw: false })
    const onSetDraw = jest.fn()
    renderWithMantineProvider(
      <MatchCard match={match} player1={player1} player2={player2} onSelectWinner={jest.fn()} onSetDraw={onSetDraw} />
    )
    fireEvent.click(screen.getByTestId(`match-card-divider-${match.id}`))
    expect(onSetDraw).toHaveBeenCalled()
  })

  it('does not call onSetDraw when divider is clicked for BYE', () => {
    const match = buildMatch({ playerIds: [player1.id, null], isDraw: false })
    const onSetDraw = jest.fn()
    renderWithMantineProvider(
      <MatchCard match={match} player1={player1} player2={null} onSelectWinner={jest.fn()} onSetDraw={onSetDraw} />
    )
    fireEvent.click(screen.getByTestId(`match-card-divider-${match.id}`))
    expect(onSetDraw).not.toHaveBeenCalled()
  })
})
