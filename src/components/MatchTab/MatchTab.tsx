import { Button, Group, Loader, Paper, ScrollArea, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { db, Event } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import roundCreate from '../../db/round/round-create'
import generateSwissPairings from '../../utils/swiss'
import RoundList from '../RoundList/RoundList'

export interface MatchTabProps {
  event: Event
  focused?: boolean
}

export default function MatchTab({ event }: MatchTabProps) {
  const [loading, setLoading] = useState(false)
  const [view, setView] = useLocalStorage<'list' | 'grid'>({
    key: 'matches-view',
    defaultValue: 'list',
  })

  const players = useLiveQuery(async () => db.players.where({ eventId: event.id }).toArray(), [event.id])

  const rounds = useLiveQuery(
    async () => (await db.rounds.where({ eventId: event.id }).sortBy('number')).reverse(),
    [event.id]
  )

  const currentRound = useLiveQuery(async () => eventCurrentRound(event), [event])

  const startNextRound = useCallback(async () => {
    setLoading(true)

    try {
      const pairings = await generateSwissPairings(event)
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
      <Group justify="end" mb="md" w="100%">
        <Button variant="outline" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
          {view === 'list' ? 'Grid View' : 'List View'}
        </Button>

        <Button onClick={() => startNextRound()} loading={loading} disabled={!roundComplete}>
          {event.currentRound === null ? 'Start Tournament' : `Start Round ${event.currentRound + 1}`}
        </Button>
      </Group>

      {rounds.length > 0 ? (
        <ScrollArea w="100%">
          <RoundList view={view} event={event} rounds={rounds} players={players} />
        </ScrollArea>
      ) : (
        <Paper withBorder p="lg" shadow="sm">
          <Text>Click start tournament to create the first round</Text>
        </Paper>
      )}
    </>
  )
}
