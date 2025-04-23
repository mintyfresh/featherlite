import { Button, Group, Loader } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db, Event } from '../../../db'
import eventCurrentRound from '../../../db/event/event-current-round'
import roundCreate from '../../../db/round/round-create'
import { generateSwissPairings } from '../../../utils/swissPairings'
import RoundsList from './RoundsList'

export interface MatchesTabProps {
  event: Event
}

export default function MatchesTab({ event }: MatchesTabProps) {
  const players = useLiveQuery(
    async () => db.players.where({ eventId: event.id }).toArray(),
    [event.id, event.updatedAt]
  )

  const rounds = useLiveQuery(
    async () => (await db.rounds.where({ eventId: event.id }).sortBy('number')).reverse(),
    [event.id, event.currentRound]
  )

  const currentRound = useLiveQuery(
    async () => eventCurrentRound(event),
    [event.id, event.currentRound]
  )

  const startNextRound = useCallback(
    async () => {
      const matches = await generateSwissPairings(event.id)
      await roundCreate(event.id, { matches })
    },
    [event.id]
  )


  if (!players || !rounds) {
    return (
      <Loader />
    )
  }

  return (
    <>
      <Group justify="end" mb="md">
        <Button onClick={() => startNextRound()} disabled={currentRound ? !currentRound.isComplete : false}>
          {event.currentRound === null ? 'Start Tournament' : `Start Round ${event.currentRound + 1}`}
        </Button>
      </Group>

      <RoundsList
        event={event}
        rounds={rounds}
        players={players}
      />
    </>
  )
}
