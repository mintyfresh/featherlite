import { Button, Group, Loader, Paper, ScrollArea, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { Event } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import eventPlayers from '../../db/event/event-players'
import roundCreate from '../../db/round/round-create'
import roundList from '../../db/round/round-list'
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

  const players = useLiveQuery(() => eventPlayers(event), [event])
  const rounds = useLiveQuery(() => roundList(event), [event])
  const currentRound = useLiveQuery(() => eventCurrentRound(event), [event])

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

        <Button onClick={() => startNextRound()} loading={loading} disabled={!roundComplete || players.length === 0}>
          {event.currentRound === null ? 'Start Tournament' : `Start Round ${event.currentRound + 1}`}
        </Button>
      </Group>

      {rounds.length > 0 ? (
        <ScrollArea w="100%">
          <RoundList view={view} event={event} rounds={rounds} players={players} />
        </ScrollArea>
      ) : (
        <Paper withBorder p="lg" shadow="sm">
          <Text c="dimmed" size="sm">
            {players.length === 0
              ? 'You need to add at least one player to start the tournament'
              : 'Click start tournament to create the first round'}
          </Text>
        </Paper>
      )}
    </>
  )
}
