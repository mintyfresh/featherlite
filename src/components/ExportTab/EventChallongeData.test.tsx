import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { buildEvent } from '../../test/db/event-factory'
import { buildPlayer } from '../../test/db/player-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import EventChallongeData from './EventChallongeData'

jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn(),
}))

const mockUseLiveQuery = require('dexie-react-hooks').useLiveQuery

describe('EventChallongeData', () => {
  const event = buildEvent()
  const player1 = buildPlayer({ name: 'Alice', wins: 2, losses: 1, draws: 0, score: 6, opponentWinRate: 0.75 })
  const player2 = buildPlayer({ name: 'Bob', wins: 1, losses: 2, draws: 0, score: 3, opponentWinRate: 0.5 })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty when no players', () => {
    mockUseLiveQuery.mockReturnValue(undefined)
    renderWithMantineProvider(<EventChallongeData event={event} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('renders challonge data for players', () => {
    mockUseLiveQuery.mockReturnValue([player1, player2])
    renderWithMantineProvider(<EventChallongeData event={event} />)
    const expected = ['1|Alice|2-1-0|0|6|0|0.7500|0', '2|Bob|1-2-0|0|3|0|0.5000|0'].join('\n')
    expect(screen.getByRole('textbox')).toHaveValue(expected)
  })

  it('copy button copies challonge data', async () => {
    mockUseLiveQuery.mockReturnValue([player1])
    const copy = jest.fn()
    jest.spyOn(require('@mantine/hooks'), 'useClipboard').mockReturnValue({ copy, copied: false })
    renderWithMantineProvider(<EventChallongeData event={event} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(copy).toHaveBeenCalled()
  })
})
