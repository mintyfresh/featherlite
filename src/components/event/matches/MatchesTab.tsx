import { useLiveQuery } from 'dexie-react-hooks'
import { db, Event } from '../../../db'
import RoundsTable from './RoundsTable'
import { Loader } from '@mantine/core'

export interface MatchesTabProps {
  event: Event
}

export default function MatchesTab({ event }: MatchesTabProps) {
  const players = useLiveQuery(
    async () => db.players.where({ eventId: event.id }).toArray(),
    [event.id]
  )

  const rounds = useLiveQuery(
    async () => (await db.rounds.where({ eventId: event.id }).sortBy('number')).reverse(),
    [event.id]
  )

  if (!players || !rounds) {
    return (
      <Loader />
    )
  }

  return (
    <>
      <RoundsTable
        event={event}
        rounds={rounds}
        players={players}
      />
    </>
  )
}
