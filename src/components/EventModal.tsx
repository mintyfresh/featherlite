import { Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { Event } from '../db'
import { DatabaseError } from '../db/errors'
import eventCreate from '../db/event-create'
import eventUpdate from '../db/event-update'

interface EventModalProps {
  event?: Event | null
  opened: boolean
  onClose(): void
  onSubmit?(event: Event): void
}

export default function EventModal({
  event,
  opened,
  onClose,
  onSubmit,
}: EventModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DatabaseError | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const name = formData.get('name') as string

    setLoading(true)
    setError(null)

    try {
      let result: Event

      if (event?.id) {
        result = await eventUpdate(event.id, { name })
      } else {
        result = await eventCreate({ name })
      }

      onSubmit?.(result)
      onClose()
    } catch (error) {
      if (error instanceof DatabaseError) {
        setError(error)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
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
          disabled={loading}
        />
        {error?.message && (
          <Text c="red">{error.message}</Text>
        )}
        <Button type="submit" loading={loading}>
          {event ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </Modal>
  )
} 