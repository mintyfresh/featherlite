import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Table,
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

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Player</Table.Th>
            <Table.Th>Wins</Table.Th>
            <Table.Th>Draws</Table.Th>
            <Table.Th>Losses</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Opp. Win %</Table.Th>
            <Table.Th style={{ width: '100px' }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {players.map((player) => (
            <Table.Tr key={player.id}>
              <Table.Td>
                <Group gap="xs">
                  <Text>{player.name}</Text>
                  {player.paid && <Badge color="green">Paid</Badge>}
                  {player.dropped && <Badge color="red">Dropped</Badge>}
                </Group>
              </Table.Td>
              <Table.Td>{player.stats.wins}</Table.Td>
              <Table.Td>{player.stats.draws}</Table.Td>
              <Table.Td>{player.stats.losses}</Table.Td>
              <Table.Td>{player.stats.score}</Table.Td>
              <Table.Td>{player.stats.opponentWinPercentage.toFixed(2)}%</Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => {
                      setEditingPlayer(player)
                      setModalOpened(true)
                    }}
                  >
                    ✎
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => handleDeletePlayer(player.id)}
                  >
                    ×
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

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