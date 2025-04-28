import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Event } from '../../db'
import { DatabaseError } from '../../db/errors'
import * as eventCreateModule from '../../db/event/event-create'
import * as eventUpdateModule from '../../db/event/event-update'
import { buildEvent } from '../../test/db/event-factory'
import { renderWithMantineProvider } from '../../test/test-utils'
import EventModal from './EventModal'

describe('EventModal', () => {
  const onClose = jest.fn()
  const onSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create mode with empty input', () => {
    renderWithMantineProvider(<EventModal opened={true} onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getByText('Create Event')).toBeInTheDocument()
    expect(screen.getByLabelText('Name', { exact: false })).toHaveValue('')
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('renders edit mode with event data', () => {
    const event = buildEvent({ name: 'Test Event' })
    renderWithMantineProvider(<EventModal event={event} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getByText('Edit Event')).toBeInTheDocument()
    expect(screen.getByLabelText('Name', { exact: false })).toHaveValue('Test Event')
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('calls eventCreate and onSubmit on create', async () => {
    const mockCreate = jest.spyOn(eventCreateModule, 'default').mockResolvedValue(buildEvent({ name: 'New Event' }))
    renderWithMantineProvider(<EventModal opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: 'New Event' } })
    fireEvent.submit(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: 'New Event' })
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Event' }))
    })
  })

  it('calls eventUpdate and onSubmit on update', async () => {
    const event = buildEvent({ id: 'event-2', name: 'Old Name' })
    const mockUpdate = jest.spyOn(eventUpdateModule, 'default').mockResolvedValue({ ...event, name: 'Updated Name' })
    renderWithMantineProvider(<EventModal event={event} opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByPlaceholderText(/adventure/i), { target: { value: 'Updated Name' } })
    fireEvent.submit(screen.getByRole('button', { name: /update/i }))
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('event-2', { name: 'Updated Name' })
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }))
    })
  })

  it('shows error message on DatabaseError', async () => {
    const error = new DatabaseError('Name is required')
    jest.spyOn(eventCreateModule, 'default').mockRejectedValue(error)
    renderWithMantineProvider(<EventModal opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByPlaceholderText(/adventure/i), { target: { value: '' } })
    fireEvent.submit(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('disables input and button while loading', async () => {
    let resolvePromise: (value?: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    jest.spyOn(eventCreateModule, 'default').mockReturnValue(pendingPromise as Promise<Event>)
    renderWithMantineProvider(<EventModal opened={true} onClose={onClose} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name', { exact: false }), { target: { value: 'Loading Event' } })
    fireEvent.submit(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByLabelText('Name', { exact: false })).toBeDisabled()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    resolvePromise!()
    await waitFor(() => expect(screen.getByLabelText('Name', { exact: false })).not.toBeDisabled())
  })

  it('calls onClose when modal is closed', async () => {
    renderWithMantineProvider(<EventModal opened={true} onClose={onClose} onSubmit={onSubmit} />)
    // Focus an element inside the modal to ensure the modal is active
    const input = screen.getByLabelText('Name', { exact: false })
    input.focus()
    await userEvent.keyboard('{Escape}')
    // Mantine Modal calls onClose on Escape
    expect(onClose).toHaveBeenCalled()
  })
})
