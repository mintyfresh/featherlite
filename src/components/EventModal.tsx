import { useState } from 'react'
import { Modal, Stack, TextInput, Button, Text } from '@mantine/core'
import { Event } from '../db'

interface EventModalProps {
  opened: boolean
  onClose: () => void
  onSubmit: (event: Omit<Event, 'id' | 'createdAt' | 'playerCount'>) => void
  initialName?: string
  title: string
  submitLabel: string
}

export function EventModal({ 
  opened, 
  onClose, 
  onSubmit, 
  initialName = '', 
  title, 
  submitLabel 
}: EventModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const name = formData.get('name') as string
    
    try {
      await onSubmit({ name })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack component="form" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          name="name"
          placeholder={`e.g. Adventure ${(new Date()).getFullYear()}`}
          defaultValue={initialName}
          required
          error={error}
        />
        <Button type="submit">{submitLabel}</Button>
      </Stack>
    </Modal>
  )
} 