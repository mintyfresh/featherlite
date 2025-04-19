import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  ActionIcon,
  Text,
} from '@mantine/core'
import { getEvent, getEventPlayers, addPlayer, updatePlayer, deletePlayer, Event, Player } from '../db'
import { PlayerModal } from './PlayerModal'

export function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
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
    setPlayers(loadedPlayers)
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
            <Table.Th>Name</Table.Th>
            <Table.Th>Paid</Table.Th>
            <Table.Th>Dropped</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {players.map((player) => (
            <Table.Tr key={player.id}>
              <Table.Td>{player.name}</Table.Td>
              <Table.Td>{player.paid ? '✓' : ''}</Table.Td>
              <Table.Td>{player.dropped ? '✓' : ''}</Table.Td>
              <Table.Td>
                <Group gap="xs">
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