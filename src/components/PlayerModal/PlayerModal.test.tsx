import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as playerCreateModule from '../../db/player/player-create'
import * as playerUpdateModule from '../../db/player/player-update'
import { buildPlayer } from '../../test/db/player-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import PlayerModal from './PlayerModal'
import { RecordValidationError } from '../../db/errors'
import { Player } from '../../db'

jest.mock('../../db/player/player-create')
jest.mock('../../db/player/player-update')

const onClose = jest.fn()
const onSubmit = jest.fn()
const eventId = 'event-1'

describe('PlayerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create mode with empty input', () => {
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getByText('Add Player')).toBeInTheDocument()
    expect(screen.getByLabelText('Name', { exact: false })).toHaveValue('')
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Paid')).toBeChecked()
    expect(screen.getByLabelText('Dropped')).not.toBeChecked()
    expect(screen.getByLabelText('Create another player')).toBeInTheDocument()
  })

  it('renders edit mode with player data', () => {
    const player = buildPlayer({ name: 'Alice', paid: false, dropped: true })
    renderWithMantineProvider(
      <PlayerModal eventId={eventId} player={player} opened={true} onClose={onClose} onSubmit={onSubmit} />
    )
    expect(screen.getByText('Edit Player')).toBeInTheDocument()
    expect(screen.getByLabelText('Name', { exact: false })).toHaveValue('Alice')
    expect(screen.getByLabelText('Paid')).not.toBeChecked()
    expect(screen.getByLabelText('Dropped')).toBeChecked()
    expect(screen.queryByLabelText('Create another player')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('calls playerCreate and onSubmit on create', async () => {
    const player = buildPlayer({ name: 'Bob' })
    jest.spyOn(playerCreateModule, 'default').mockResolvedValue(player)
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: 'Bob' } })
    fireEvent.click(screen.getByLabelText('Paid')) // toggle off
    fireEvent.submit(screen.getByTestId('player-modal-form'))
    await waitFor(() => {
      expect(playerCreateModule.default).toHaveBeenCalledWith(
        eventId,
        expect.objectContaining({ name: 'Bob', paid: false, dropped: false })
      )
      expect(onSubmit).toHaveBeenCalledWith(player)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('calls playerUpdate and onSubmit on update', async () => {
    const player = buildPlayer({ id: 'p-1', name: 'Carol', paid: true, dropped: false })
    const updated = { ...player, name: 'Caroline' }
    jest.spyOn(playerUpdateModule, 'default').mockResolvedValue(updated)
    renderWithMantineProvider(
      <PlayerModal eventId={eventId} player={player} opened={true} onClose={onClose} onSubmit={onSubmit} />
    )
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: 'Caroline' } })
    fireEvent.submit(screen.getByTestId('player-modal-form'))
    await waitFor(() => {
      expect(playerUpdateModule.default).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({ name: 'Caroline', paid: true, dropped: false })
      )
      expect(onSubmit).toHaveBeenCalledWith(updated)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message on error', async () => {
    const error = new RecordValidationError('Player', null, [
      ['name', "can't be blank"],
      [null, 'General error'],
    ])
    jest.spyOn(playerCreateModule, 'default').mockRejectedValue(error)
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: '' } })
    fireEvent.submit(screen.getByTestId('player-modal-form'))
    await waitFor(() => {
      expect(screen.getByText("name can't be blank")).toBeInTheDocument()
      expect(screen.getByText('General error')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('disables input and button while loading', async () => {
    let resolvePromise: (value?: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    jest.spyOn(playerCreateModule, 'default').mockReturnValue(pendingPromise as Promise<Player>)
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: 'Loading Player' } })
    fireEvent.submit(screen.getByTestId('player-modal-form'))
    expect(screen.getByLabelText('Name', { exact: false })).toBeDisabled()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    resolvePromise!()
    await waitFor(() => expect(screen.getByLabelText('Name', { exact: false })).not.toBeDisabled())
  })

  it('calls onClose when modal is closed', async () => {
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    const input = screen.getByLabelText('Name', { exact: false })
    input.focus()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('clears and focuses name input if createAnotherPlayer is checked', async () => {
    const player = buildPlayer({ name: 'Zed' })
    jest.spyOn(playerCreateModule, 'default').mockResolvedValue(player)
    renderWithMantineProvider(<PlayerModal eventId={eventId} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    const nameInput = screen.getByLabelText('Name', { exact: false }) as HTMLInputElement
    const createAnother = screen.getByLabelText('Create another player')
    // Check the box
    fireEvent.click(createAnother)
    // Enter a name and submit
    fireEvent.change(nameInput, { target: { value: 'Zed' } })
    fireEvent.submit(screen.getByTestId('player-modal-form'))
    await waitFor(() => {
      expect(playerCreateModule.default).toHaveBeenCalled()
      expect(nameInput.value).toBe('')
      expect(document.activeElement).toBe(nameInput)
      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
