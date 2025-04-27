import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { buildEvent } from '../../test/db/event-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import ExportTab from './ExportTab'

jest.mock('./EventStandingsTable', () => () => <div data-testid="standings-table">StandingsTable</div>)
jest.mock('./EventMatchesTable', () => () => <div data-testid="matches-table">MatchesTable</div>)
jest.mock('./EventChallongeData', () => () => <div data-testid="challonge-data">ChallongeData</div>)

describe('ExportTab', () => {
  it('renders all sections and passes event prop', () => {
    const event = buildEvent({ currentRound: 3 })
    renderWithMantineProvider(<ExportTab event={event} />)
    expect(screen.getByText('Standings')).toBeInTheDocument()
    expect(screen.getByText('Round 3 Matches')).toBeInTheDocument()
    expect(screen.getByText('Challonge Data')).toBeInTheDocument()
    expect(screen.getByTestId('standings-table')).toBeInTheDocument()
    expect(screen.getByTestId('matches-table')).toBeInTheDocument()
    expect(screen.getByTestId('challonge-data')).toBeInTheDocument()
  })

  it('shows dash for round if currentRound is null', () => {
    const event = buildEvent({ currentRound: null })
    renderWithMantineProvider(<ExportTab event={event} />)
    expect(screen.getByText('Round - Matches')).toBeInTheDocument()
  })
})
