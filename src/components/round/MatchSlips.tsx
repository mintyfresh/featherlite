import { Button, Group, Stack, Switch } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../db'
import eventGet from '../../db/event/event-get'
import roundGet from '../../db/round/round-get'
import roundMatches from '../../db/round/round-matches'
import LegacyMatchSlip from './LegacyMatchSlip'
import './MatchSlips.css'

export default function MatchSlips() {
  const [includeBye, setIncludeBye] = useLocalStorage({ key: 'includeBye', defaultValue: false })

  const { id } = useParams<{ id: string }>()
  const round = useLiveQuery(() => (id ? roundGet(id) : null), [id])
  const event = useLiveQuery(() => (round?.eventId ? eventGet(round.eventId) : null), [round?.eventId])

  const matches = useLiveQuery(() => (id ? roundMatches(id) : []), [id])
  const playerIds = matches?.flatMap((match) => match.playerIds).filter((id) => id !== null) as string[]

  const players = useLiveQuery(() => (playerIds ? db.players.where('id').anyOf(playerIds).toArray() : []), [playerIds])
  const playersById = useMemo(() => new Map(players?.map((player) => [player.id, player])), [players])

  const filteredMatches = useMemo(
    () => (includeBye ? matches : matches?.filter((match) => match.playerIds[1] !== null)),
    [includeBye, matches]
  )

  if (!round || !event) {
    return <div>Round not found</div>
  }

  if (!matches || !playersById || !filteredMatches) {
    return <div>Matches not found</div>
  }

  return (
    <>
      <Group justify="end" m="xs" className="print-hidden">
        <Switch
          label="Include Bye"
          checked={includeBye}
          onChange={(event) => setIncludeBye(event.currentTarget.checked)}
        />
        <Button variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </Group>
      <Stack gap="0">
        {filteredMatches.map((match) => (
          <LegacyMatchSlip
            key={match.id}
            event={event}
            round={round}
            players={[
              playersById.get(match.playerIds[0])!,
              match.playerIds[1] ? playersById.get(match.playerIds[1])! : null,
            ]}
            match={match}
          />
        ))}
      </Stack>
    </>
  )
}
