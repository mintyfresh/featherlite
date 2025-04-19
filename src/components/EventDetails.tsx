import {
  Button,
  Container,
  Group,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  addPlayer, 
  deletePlayer, 
  Event, 
  getEvent, 
  getEventPlayers, 
  getPlayerStats,
  Player, 
  updatePlayer 
} from '../db'
import { PlayerModal } from './PlayerModal'
import { PlayersTable } from './PlayersTable'

interface PlayerWithStats extends Player {
  stats: {
    wins: number
    draws: number
    losses: number
    score: number
    opponentWinPercentage: number
  }
}

export function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [players, setPlayers] = useState<PlayerWithStats[]>([])
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    loadEvent()
    loadPlayers()
  }, [id])

  async function loadEvent() {
    if (!id) return
    const loadedEvent = await getEvent(id)
    if (!loadedEvent) {
      navigate('/')
      return
    }
    setEvent(loadedEvent)
  }

  async function loadPlayers() {
    if (!id) return
    const loadedPlayers = await getEventPlayers(id)
    const playersWithStats = await Promise.all(
      loadedPlayers.map(async (player) => ({
        ...player,
        stats: await getPlayerStats(id, player.id)
      }))
    )
    setPlayers(playersWithStats)
  }

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

  if (!event) return null

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>{event.name}</Title>
        <Button variant="subtle" onClick={() => navigate('/')}>← Back to Events</Button>
      </Group>

      <Group justify="space-between" mb="xl">
        <Text>Players</Text>
        <Button onClick={() => setModalOpened(true)}>Add Player</Button>
      </Group>

      <PlayersTable
        players={players}
        onEditPlayer={(player) => {
          setEditingPlayer(player)
          setModalOpened(true)
        }}
        onDeletePlayer={handleDeletePlayer}
      />

      <PlayerModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingPlayer(null)
          setError(null)
        }}
        onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
        initialValues={editingPlayer ?? undefined}
        title={editingPlayer ? 'Edit Player' : 'New Player'}
        submitLabel={editingPlayer ? 'Save Changes' : 'Add Player'}
        error={error}
      />
    </Container>
  )
} 