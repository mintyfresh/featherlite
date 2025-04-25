import { Button, Group, Loader, Paper, Text } from '@mantine/core'
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
    [event.id, event.updatedAt]
  )

  if (!players) {
    return <Loader />
  }

  return (
    <>
      <Group justify="end" mb="md">
        <Button accessKey="a" onClick={() => setModalOpened(true)}>Add Player</Button>
      </Group>

      {players.length > 0 ? (
        <PlayersTable
          players={players}
          onPlayerEdit={(player) => {
            setEditingPlayer(player)
            setModalOpened(true)
          }}
        />
      ) : (
        <Paper withBorder p="lg" shadow="sm">
          <Text>No players have been added yet</Text>
        </Paper>
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