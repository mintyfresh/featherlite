import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Event } from '../../db'
import eventCreate from '../../db/event/event-create'
import eventUpdate from '../../db/event/event-update'
import useFormErrors from '../../hooks/use-form-errors'
import FormBaseErrors from '../FormBaseErrors/FormBaseErrors'

export interface EventModalProps {
  event?: Event | null
  opened: boolean
  onClose(): void
  onSubmit(event: Event): void
}

export default function EventModal({ event, opened, onClose, onSubmit }: EventModalProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useFormErrors()

  useEffect(() => {
    if (!opened) {
      setErrors(null)
    }
  }, [opened, setErrors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const name = formData.get('name') as string

    setLoading(true)
    setErrors(null)

    try {
      let result: Event

      if (event?.id) {
        result = await eventUpdate(event.id, { name })
      } else {
        result = await eventCreate({ name })
      }

      onSubmit(result)
    } catch (error) {
      setErrors(error)
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
          placeholder={`e.g. Adventure ${new Date().getFullYear()}`}
          defaultValue={event?.name}
          error={errors.get('name')}
          required
          disabled={loading}
          autoComplete="off"
          data-autofocus
        />
        <FormBaseErrors errors={errors} except={['name']} />
        <Button type="submit" loading={loading}>
          {event ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </Modal>
  )
}
