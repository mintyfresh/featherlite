import { Button, Group, Loader, Paper, Text } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { db, Event } from '../../../db'
import eventCurrentRound from '../../../db/event/event-current-round'
import roundCreate from '../../../db/round/round-create'
import generateSwissPairings, { preloadSwissDependencies } from '../../../utils/swiss'
import RoundsList from './RoundsList'
import { useLocalStorage } from '@mantine/hooks'

export interface MatchesTabProps {
  event: Event
}

export default function MatchesTab({ event }: MatchesTabProps) {
  const [loading, setLoading] = useState(false)
  const [view, setView] = useLocalStorage<'table' | 'grid'>({
    key: 'matches-view',
    defaultValue: 'table',
  })

  const players = useLiveQuery(async () => db.players.where({ eventId: event.id }).toArray(), [event.id])

  const rounds = useLiveQuery(
    async () => (await db.rounds.where({ eventId: event.id }).sortBy('number')).reverse(),
    [event.id]
  )

  const currentRound = useLiveQuery(async () => eventCurrentRound(event), [event])

  useEffect(
    // Start loading the Python runtime and dependencies as soon as the component mounts
    () => {
      preloadSwissDependencies()
    },
    []
  )

  const startNextRound = useCallback(async () => {
    setLoading(true)

    try {
      const pairings = await generateSwissPairings(event)
      console.log(pairings)
      const matches = pairings.map((playerIds) => ({ playerIds }))

      await roundCreate(event.id, { matches })
    } finally {
      setLoading(false)
    }
  }, [event])

  const roundComplete = !currentRound || currentRound.isComplete

  if (!players || !rounds) {
    return <Loader />
  }

  return (
    <>
      <Group justify="end" mb="md">
        <Button variant="outline" onClick={() => setView(view === 'table' ? 'grid' : 'table')}>
          {view === 'table' ? 'Grid View' : 'Table View'}
        </Button>

        <Button onClick={() => startNextRound()} loading={loading} disabled={!roundComplete}>
          {event.currentRound === null ? 'Start Tournament' : `Start Round ${event.currentRound + 1}`}
        </Button>
      </Group>

      {rounds.length > 0 ? (
        <RoundsList view={view} event={event} rounds={rounds} players={players} />
      ) : (
        <Paper withBorder p="lg" shadow="sm">
          <Text>Click start tournament to create the first round</Text>
        </Paper>
      )}
    </>
  )
}
