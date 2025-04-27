import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithMantineProvider } from '../../test/test-utils'
import { buildMatch } from '../../test/db/match-factory'
import MatchCardDivider from './MatchCardDivider'

describe('MatchCardDivider', () => {
  const onSetDraw = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders TIE and is interactive when not a bye and not a draw', () => {
    const match = buildMatch({ playerIds: ['p1', 'p2'], isDraw: false })
    renderWithMantineProvider(<MatchCardDivider match={match} onSetDraw={onSetDraw} />)
    expect(screen.getByText('TIE')).toBeInTheDocument()
    expect(screen.getByTestId(`match-card-divider-${match.id}`)).toHaveAttribute('data-test-isdraw', 'false')
    const divider = screen.getByRole('button')
    expect(divider).toBeInTheDocument()
    fireEvent.click(divider)
    expect(onSetDraw).toHaveBeenCalled()
  })

  it('renders << TIE >> and green color when isDraw is true', () => {
    const match = buildMatch({ playerIds: ['p1', 'p2'], isDraw: true })
    renderWithMantineProvider(<MatchCardDivider match={match} onSetDraw={onSetDraw} />)
    const label = screen.getByText('<< TIE >>')
    expect(label).toBeInTheDocument()
    expect(screen.getByTestId(`match-card-divider-${match.id}`)).toHaveAttribute('data-test-isdraw', 'true')
  })

  it('renders BYE and is not interactive when second player is null', () => {
    const match = buildMatch({ playerIds: ['p1', null], isDraw: false })
    renderWithMantineProvider(<MatchCardDivider match={match} onSetDraw={onSetDraw} />)
    expect(screen.getByText('BYE')).toBeInTheDocument()
    // Should not have role button
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not call onSetDraw when BYE divider is clicked', () => {
    const match = buildMatch({ playerIds: ['p1', null], isDraw: false })
    renderWithMantineProvider(<MatchCardDivider match={match} onSetDraw={onSetDraw} />)
    // Try to click the divider (should not be interactive)
    const divider = screen.getByText('BYE').closest('div')
    if (divider) fireEvent.click(divider)
    expect(onSetDraw).not.toHaveBeenCalled()
  })
})
