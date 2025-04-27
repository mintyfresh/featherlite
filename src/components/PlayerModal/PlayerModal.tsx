import { Alert, Button, Checkbox, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { Player } from '../../db'
import playerCreate from '../../db/player/player-create'
import playerUpdate from '../../db/player/player-update'
import useFormErrors from '../../hooks/use-form-errors'

export interface PlayerModalProps {
  eventId: string
  player?: Player | null
  opened: boolean
  onClose(): void
  onSubmit?(player: Omit<Player, 'id' | 'eventId'>): void
}

export default function PlayerModal({ eventId, player, opened, onClose, onSubmit }: PlayerModalProps) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useFormErrors()

  const [createAnotherPlayer, setCreateAnotherPlayer] = useLocalStorage({
    key: 'createAnotherPlayer',
    defaultValue: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const input = {
      name: formData.get('name') as string,
      paid: formData.get('paid') === 'true',
      dropped: formData.get('dropped') === 'true',
    }

    setLoading(true)
    setErrors(null)

    try {
      let result: Player

      if (player?.id) {
        result = await playerUpdate(player.id, input)
      } else {
        result = await playerCreate(eventId, input)
      }

      onSubmit?.(result)

      if (player?.id || !createAnotherPlayer) {
        onClose()
      } else if (createAnotherPlayer) {
        if (nameRef.current) {
          nameRef.current.value = ''
          nameRef.current.focus()
        }
      }
    } catch (error) {
      setErrors(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={player ? 'Edit Player' : 'Add Player'}>
      <Stack component="form" onSubmit={handleSubmit} data-testid="player-modal-form">
        <TextInput
          label="Name"
          name="name"
          placeholder="Enter player name"
          defaultValue={player?.name ?? ''}
          error={errors.get('name')}
          ref={nameRef}
          required
          autoComplete="off"
          data-autofocus
          disabled={loading}
        />
        <Checkbox label="Paid" name="paid" defaultChecked={player?.paid ?? true} value="true" disabled={loading} />
        <Checkbox
          label="Dropped"
          name="dropped"
          defaultChecked={player?.dropped ?? false}
          value="true"
          disabled={loading}
        />
        {!player?.id && (
          <Checkbox
            label="Create another player"
            name="createAnotherPlayer"
            checked={createAnotherPlayer}
            onChange={(event) => setCreateAnotherPlayer(event.currentTarget.checked)}
            disabled={loading}
          />
        )}
        {errors.any(null) && (
          <Alert color="red" icon={<IconAlertCircle />}>
            {errors.get(null)!.map((message) => (
              <Text key={message}>{message}</Text>
            ))}
          </Alert>
        )}
        <Button type="submit" loading={loading}>
          {player?.id ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </Modal>
  )
}
