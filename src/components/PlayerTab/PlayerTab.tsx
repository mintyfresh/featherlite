import { Button, Group, Loader, Paper, ScrollArea, Text } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Event, Player } from '../../db'
import eventPlayers from '../../db/event/event-players'
import PlayerModal from '../PlayerModal/PlayerModal'
import PlayersTable from '../PlayerTable/PlayerTable'

export interface PlayerTabProps {
  event: Event
  focused?: boolean
}

export default function PlayerTab({ event }: PlayerTabProps) {
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const players = useLiveQuery(() => eventPlayers(event, { includeDropped: true }), [event])

  if (!players) {
    return <Loader />
  }

  return (
    <>
      <Group justify="end" mb="md">
        <Button accessKey="a" onClick={() => setModalOpened(true)}>
          Add Player
        </Button>
      </Group>

      {players.length > 0 ? (
        <ScrollArea w="100%">
          <PlayersTable
            players={players}
            onPlayerEdit={(player) => {
              setEditingPlayer(player)
              setModalOpened(true)
            }}
          />
        </ScrollArea>
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
