import { ActionIcon, Textarea } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Event, Player } from '../../db'
import eventPlayers from '../../db/event/event-players'

function formatPlayerChallongeData(player: Player, standing: number) {
  return (
    `${standing}|` +
    `${player.name}|` +
    `${player.wins}-${player.losses}-${player.draws}|` +
    `0|` +
    `${player.score}|` +
    `0|` +
    `${player.opponentWinRate.toFixed(4)}|` +
    `0`
  )
}

export interface EventChallongeDataProps {
  event: Event
}

export default function EventChallongeData({ event }: EventChallongeDataProps) {
  const clipboard = useClipboard()

  const players = useLiveQuery(async () => eventPlayers(event), [event])
  const data = useMemo(
    () => players?.map((player, index) => formatPlayerChallongeData(player, index + 1)).join('\n'),
    [players]
  )

  return (
    <Textarea
      autosize
      value={data}
      rightSection={
        <ActionIcon size="compact-xs" variant="transparent" onClick={() => clipboard.copy(data)}>
          {clipboard.copied ? <IconCheck /> : <IconCopy />}
        </ActionIcon>
      }
      readOnly
    />
  )
}
