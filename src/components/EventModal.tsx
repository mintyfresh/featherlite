import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { addEvent as addEventQuery, Event, updateEvent as updateEventQuery } from '../db'
import { useLazyDBQuery } from '../hooks/use-db-query'

interface EventModalProps {
  event?: Event | null
  opened: boolean
  onClose(): void
  onSubmit(event: Event): void
}

export default function EventModal({
  event,
  opened,
  onClose,
  onSubmit,
}: EventModalProps) {
  const [createEvent] = useLazyDBQuery(addEventQuery, {
    onSuccess(event) {
      onSubmit(event)
      onClose()
    }
  })
  const [updateEvent] = useLazyDBQuery(updateEventQuery, {
    onSuccess(event) {
      onSubmit(event)
      onClose()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const name = formData.get('name') as string

    if (event?.id) {
      updateEvent(event.id, { name })
    } else {
      createEvent({ name, createdAt: new Date(), playersCount: 0, currentRound: null })
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={event ? 'Edit Event' : 'Create Event'}>
      <Stack component="form" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          name="name"
          placeholder={`e.g. Adventure ${(new Date()).getFullYear()}`}
          defaultValue={event?.name}
          required
        />
        <Button type="submit">
          {event ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </Modal>
  )
} 