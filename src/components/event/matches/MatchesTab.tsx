import { Button, Group, Loader, Paper, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { db, Event } from '../../../db'
import eventCurrentRound from '../../../db/event/event-current-round'
import roundCreate from '../../../db/round/round-create'
import generateSwissPairings, { isPythonContextLoaded, preloadPythonContext } from '../../../utils/swiss'
import RoundsList from './RoundsList'

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

  const startNextRound = useCallback(async () => {
    setLoading(true)

    try {
      if (!isPythonContextLoaded()) {
        const id = notifications.show({
          title: 'Loading Python runtime',
          message: 'The Python runtime is being loaded to generate pairings',
          loading: true,
          autoClose: false,
          withCloseButton: false,
        })

        await preloadPythonContext()

        notifications.update({
          id,
          color: 'green',
          title: 'Python runtime loaded',
          message: 'Players can now be paired',
          icon: <IconCheck size={18} />,
          loading: false,
          autoClose: 3000,
        })
      }

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
