import { Box, Button, Flex, Paper, Table, Text } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useRef } from 'react'
import { Event } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import eventPlayers from '../../db/event/event-players'
import roundMatches from '../../db/round/round-matches'

export interface EventMatchesTableProps {
  event: Event
}

export default function EventMatchesTable({ event }: EventMatchesTableProps) {
  const clipboard = useClipboard()
  const bodyRef = useRef<HTMLTableSectionElement>(null)

  const players = useLiveQuery(async () => eventPlayers(event), [event])
  const playersById = useMemo(() => new Map(players?.map((player) => [player.id, player] as const) ?? []), [players])

  const currentRound = useLiveQuery(async () => eventCurrentRound(event), [event])
  const matches = useLiveQuery(async () => (currentRound ? roundMatches(currentRound) : []), [currentRound])

  function formatPlayer(playerId: string | null) {
    const player = playerId && playersById.get(playerId)

    if (!player) {
      return (
        <Text size="xs" c="dimmed">
          BYE [0, 0, 0]
        </Text>
      )
    }

    return (
      <Text>
        {player.name} [{player.wins}, {player.losses}, {player.draws}]
      </Text>
    )
  }

  if (!currentRound) {
    return (
      <Paper withBorder shadow="md" p="md">
        <Text size="xs" c="dimmed">
          No rounds have been played yet
        </Text>
      </Paper>
    )
  }

  if (!matches) {
    return (
      <Paper withBorder shadow="md" p="md">
        <Text size="xs" c="dimmed">
          No matches for current round
        </Text>
      </Paper>
    )
  }

  return (
    <Box>
      <Flex justify="flex-end" mb="-24.8px">
        <Button
          color="gray"
          size="compact-xs"
          onClick={() => clipboard.copy(bodyRef.current?.innerText ?? '')}
          leftSection={clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        >
          {clipboard.copied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Table</Table.Th>
            <Table.Th>Player 1</Table.Th>
            <Table.Th>Player 2</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody ref={bodyRef}>
          {matches?.map((match) => (
            <Table.Tr key={match.id}>
              <Table.Td>Table #{match.table}</Table.Td>
              <Table.Td>{formatPlayer(match.playerIds[0])}</Table.Td>
              <Table.Td>{formatPlayer(match.playerIds[1])}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
