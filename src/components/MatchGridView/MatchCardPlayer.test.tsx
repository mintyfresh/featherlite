import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithMantineProvider } from '../../test/test-utils'
import { buildPlayer } from '../../test/db/player-factory'
import MatchCardPlayer from './MatchCardPlayer'
import { buildMatch } from '../../test/db/match-factory'

describe('MatchCardPlayer', () => {
  const player = buildPlayer({ name: 'Test Player' })
  const match = buildMatch({ playerIds: [player.id, null] })
  const onSelectWinner = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders player name', () => {
    renderWithMantineProvider(
      <MatchCardPlayer match={match} player={player} isWinner={false} onSelectWinner={onSelectWinner} />
    )
    expect(screen.getByText('Test Player')).toBeInTheDocument()
  })

  it('renders with green color when isWinner is true', () => {
    renderWithMantineProvider(
      <MatchCardPlayer match={match} player={player} isWinner={true} onSelectWinner={onSelectWinner} />
    )
    const button = screen.getByTestId(`match-card-player-${match.id}-${player.id}`)
    expect(button).toHaveAttribute('data-test-iswinner', 'true')
  })

  it('renders with black color when isWinner is false', () => {
    renderWithMantineProvider(
      <MatchCardPlayer match={match} player={player} isWinner={false} onSelectWinner={onSelectWinner} />
    )
    const button = screen.getByTestId(`match-card-player-${match.id}-${player.id}`)
    expect(button).toHaveAttribute('data-test-iswinner', 'false')
  })

  it('renders the crown icon', () => {
    renderWithMantineProvider(
      <MatchCardPlayer match={match} player={player} isWinner={false} onSelectWinner={onSelectWinner} />
    )
    // The IconCrown renders an SVG with data-icon="crown" in tabler icons
    const svg = screen.getByTestId('tabler-icon-crown')
    expect(svg).toBeInTheDocument()
  })

  it('calls onSelectWinner when clicked', () => {
    renderWithMantineProvider(
      <MatchCardPlayer match={match} player={player} isWinner={false} onSelectWinner={onSelectWinner} />
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onSelectWinner).toHaveBeenCalled()
  })

  it('passes extra props to UnstyledButton', () => {
    renderWithMantineProvider(
      <MatchCardPlayer
        match={match}
        player={player}
        isWinner={false}
        onSelectWinner={onSelectWinner}
        data-testid="custom-button"
      />
    )
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })
})
