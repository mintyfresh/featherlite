import { Button, Checkbox, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { Player } from '../../../db'
import { DatabaseError } from '../../../db/errors'
import playerCreate from '../../../db/player-create'
import playerUpdate from '../../../db/player-update'

interface PlayerModalProps {
  eventId: string
  player?: Player | null
  opened: boolean
  onClose(): void
  onSubmit?(player: Omit<Player, 'id' | 'eventId'>): void
}

export function PlayerModal({
  eventId,
  player,
  opened,
  onClose,
  onSubmit,
}: PlayerModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DatabaseError | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const input = {
      name: formData.get('name') as string,
      paid: formData.get('paid') === 'true',
      dropped: formData.get('dropped') === 'true',
    }

    setLoading(true)
    setError(null)

    try {
      let result: Player

      if (player?.id) {
        result = await playerUpdate(player.id, input)
      } else {
        result = await playerCreate(eventId, input)
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
    <Modal opened={opened} onClose={onClose} title={player ? 'Edit Player' : 'Add Player'}>
      <Stack component="form" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          name="name"
          placeholder="Enter player name"
          defaultValue={player?.name ?? ''}
          required
          autoComplete="off"
          data-autofocus
        />
        <Checkbox
          label="Paid"
          name="paid"
          defaultChecked={player?.paid ?? true}
          value="true"
          disabled={loading}
        />
        <Checkbox
          label="Dropped"
          name="dropped"
          defaultChecked={player?.dropped ?? false}
          value="true"
          disabled={loading}
        />
        {error?.message && (
          <Text c="red">{error.message}</Text>
        )}
        <Button type="submit" loading={loading}>
          {player?.id ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </Modal>
  )
} 