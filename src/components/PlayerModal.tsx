import { Modal, Stack, TextInput, Button, Checkbox, Text } from '@mantine/core'
import { Player } from '../db'

interface PlayerModalProps {
  opened: boolean
  onClose: () => void
  onSubmit: (player: Omit<Player, 'id' | 'eventId'>) => void
  initialValues?: Omit<Player, 'id' | 'eventId'>
  title: string
  submitLabel: string
  error?: string | null
}

export function PlayerModal({ 
  opened, 
  onClose, 
  onSubmit, 
  initialValues = { name: '', paid: false, dropped: false }, 
  title, 
  submitLabel,
  error
}: PlayerModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    onSubmit({
      name: formData.get('name') as string,
      paid: formData.get('paid') === 'true',
      dropped: formData.get('dropped') === 'true',
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack component="form" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          name="name"
          placeholder="Enter player name"
          defaultValue={initialValues.name}
          required
        />
        <Checkbox
          label="Paid"
          name="paid"
          defaultChecked={initialValues.paid}
          value="true"
        />
        <Checkbox
          label="Dropped"
          name="dropped"
          defaultChecked={initialValues.dropped}
          value="true"
        />
        {error && <Text c="red">{error}</Text>}
        <Button type="submit">{submitLabel}</Button>
      </Stack>
    </Modal>
  )
} 