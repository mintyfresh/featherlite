import {
  Button,
  Container,
  Group,
  Loader,
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
import { useDBQuery } from '../hooks/use-db-query'

interface PlayerStats {
  wins: number
  draws: number
  losses: number
  score: number
  opponentWinPercentage: number
}

export function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStats>>(() => new Map())
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const { result: event } = useDBQuery(getEvent, {
    params: [id!],
    skip: !id,
  })

  const { result: players } = useDBQuery(getEventPlayers, {
    params: [id!],
    skip: !id,
    onSuccess(players) {
      Promise.all(
        players.map(async (player) => [
          player.id,
          await getPlayerStats(id!, player.id)
        ] as [string, PlayerStats])
      ).then((pairs) => {
        setPlayerStats(new Map(pairs))
      })
    },
  })

  const { result: matches } = useDBQuery(getRoundMatches, {
    params: [id!, event?.currentRound!],
    skip: !!event?.currentRound
  })

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

          {players && playerStats.size > 0 && (
            <PlayersTable
              players={players}
              playerStats={playerStats}
              onEditPlayer={(player) => {
                setEditingPlayer(player)
                setModalOpened(true)
              }}
              onDeletePlayer={handleDeletePlayer}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="xl">
          {matches && players && (
            <MatchesTable
              matches={matches}
              players={players}
              currentRound={event.currentRound}
              onStartNewRound={handleStartNewRound}
              onUpdateMatch={handleUpdateMatch}
            />
          )}
        </Tabs.Panel>
      </Tabs>

      <PlayerModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingPlayer(null)
        }}
        onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
        initialValues={editingPlayer ?? undefined}
        title={editingPlayer ? 'Edit Player' : 'New Player'}
        submitLabel={editingPlayer ? 'Save Changes' : 'Add Player'}
      />
    </Container>
  )
} 