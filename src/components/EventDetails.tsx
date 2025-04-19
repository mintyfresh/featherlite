import {
  Button,
  Container,
  Group,
  Tabs,
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
  Match,
  getRoundMatches,
  updateMatch,
  addMatch,
  updatePlayer,
} from '../db'
import { PlayerModal } from './PlayerModal'
import { PlayersTable } from './PlayersTable'
import { MatchesTable } from './MatchesTable'
import { generateSwissPairings } from '../utils/swissPairings'

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
  const [matches, setMatches] = useState<Match[]>([])
  const [currentRound, setCurrentRound] = useState<number | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    loadEvent()
    loadPlayers()
    determineCurrentRound()
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

  async function determineCurrentRound() {
    if (!id) return
    
    // Check if there are any matches
    const round1Matches = await getRoundMatches(id, 1)
    
    if (round1Matches.length === 0) {
      // No matches yet, tournament hasn't started
      setCurrentRound(null)
      setMatches([])
    } else {
      // Find the highest round number
      let highestRound = 1
      let hasMoreRounds = true
      
      while (hasMoreRounds) {
        const nextRoundMatches = await getRoundMatches(id, highestRound + 1)
        if (nextRoundMatches.length > 0) {
          highestRound++
        } else {
          hasMoreRounds = false
        }
      }
      
      setCurrentRound(highestRound)
      loadMatches(highestRound)
    }
  }

  async function loadMatches(round: number) {
    if (!id) return
    const roundMatches = await getRoundMatches(id, round)
    setMatches(roundMatches)
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

  async function handleStartNewRound() {
    if (!id) return
    
    try {
      const nextRound = currentRound === null ? 1 : currentRound + 1
      
      // Get all previous matches
      const allMatches: Match[] = []
      if (currentRound !== null) {
        for (let round = 1; round <= currentRound; round++) {
          const roundMatches = await getRoundMatches(id, round)
          allMatches.push(...roundMatches)
        }
      }
      
      // Generate new pairings
      const newMatches = generateSwissPairings(players, allMatches, nextRound)
      console.log(newMatches)
      
      // Add new matches to the database
      await Promise.all(newMatches.map(match => addMatch(id, match)))
      
      // Update current round and reload matches
      setCurrentRound(nextRound)
      loadMatches(nextRound)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new round')
    }
  }

  if (!event) return null

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

          <PlayersTable
            players={players}
            onEditPlayer={(player) => {
              setEditingPlayer(player)
              setModalOpened(true)
            }}
            onDeletePlayer={handleDeletePlayer}
          />
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="xl">
          <MatchesTable
            matches={matches}
            players={players}
            currentRound={currentRound}
            onStartNewRound={handleStartNewRound}
            onUpdateMatch={handleUpdateMatch}
          />
        </Tabs.Panel>
      </Tabs>

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