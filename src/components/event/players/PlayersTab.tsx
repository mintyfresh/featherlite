import { Button, Group, Text } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, Event, Player } from '../../../db'
import { PlayerModal } from './PlayerModal'
import { PlayersTable } from './PlayersTable'

export interface PlayersTabProps {
  event: Event
}

export default function PlayersTab({ event }: PlayersTabProps) {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const players = useLiveQuery(
    async () => db.players.where({ eventId: event.id }).toArray(),
    [event.id]
  )

  return (
    <>
      <Group justify="space-between" mb="xl">
        <Text>Players</Text>
        <Button onClick={() => setModalOpened(true)}>Add Player</Button>
      </Group>

      {players && (
        <PlayersTable
          players={players}
        />
      )}

      <PlayerModal
        eventId={event.id}
        player={editingPlayer}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingPlayer(null)
        }}
      />
    </>
  )
}