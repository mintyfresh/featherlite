import {
  Button,
  Container,
  Group,
  Loader,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, Player } from '../db'
import { generateSwissPairings } from '../utils/swissPairings'
import { PlayerModal } from './PlayerModal'
import { PlayersTable } from './PlayersTable'
import RoundsTable from './RoundsTable'

export function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [error, setError] = useState<Error | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const event = useLiveQuery(
    async () => id && db.events.get(id),
    [id]
  )

  const players = useLiveQuery(
    async () => id ? db.players.where({ eventId: id }).toArray() : [],
    [id]
  )

  const rounds = useLiveQuery(
    async () => id ? (await db.rounds.where({ eventId: id }).sortBy('number')).reverse() : [],
    [id]
  )

  async function handleAddPlayer(player: Omit<Player, 'id' | 'eventId'>) {
    if (!id) return

    try {
      await addPlayer(id, player)
      setModalOpened(false)
      loadPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player')
    }
  }

  async function handleUpdatePlayer(player: Omit<Player, 'id' | 'eventId'>) {
    if (!editingPlayer?.id) return

    try {
      await updatePlayer(editingPlayer.id, player)
      setModalOpened(false)
      setEditingPlayer(null)
      loadPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player')
    }
  }

  async function handleDeletePlayer(playerId: string) {
    try {
      await deletePlayer(playerId)
      loadPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player')
    }
  }

  async function handleUpdateMatch(matchId: string, updates: Partial<Match>) {
    try {
      await updateMatch(matchId, updates)
      if (currentRound !== null) {
        loadMatches(currentRound)
      }
      loadPlayers() // Reload players to update stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match')
    }
  }

  if (!event || !players) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>{event.name}</Title>
        <Button variant="subtle" onClick={() => navigate('/')}>← Back to Events</Button>
      </Group>

      <Tabs defaultValue="players">
        <Tabs.List>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="matches">Matches</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="players" pt="xl">
          <Group justify="space-between" mb="xl">
            <Text>Players</Text>
            <Button onClick={() => setModalOpened(true)}>Add Player</Button>
          </Group>

          {players && (
            <PlayersTable
              players={players}
              onEditPlayer={(player) => {
                setEditingPlayer(player)
                setModalOpened(true)
              }}
              onDeletePlayer={handleDeletePlayer}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="xl">
          {rounds && players && (
            <RoundsTable
              eventId={event.id}
              rounds={rounds}
              players={players}
              currentRound={event.currentRound}
              onUpdateMatch={handleUpdateMatch}
            />
          )}
        </Tabs.Panel>
      </Tabs>

      <PlayerModal
        eventId={event.id}
        player={editingPlayer}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingPlayer(null)
        }}
      />
    </Container>
  )
} 