import { Box, Button, Flex, Paper, Table, Text } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRef } from 'react'
import { Event } from '../../db'
import eventPlayers from '../../db/event/event-players'

export interface EventStandingsTableProps {
  event: Event
}

export default function EventStandingsTable({ event }: EventStandingsTableProps) {
  const clipboard = useClipboard()
  const bodyRef = useRef<HTMLTableSectionElement>(null)

  const players = useLiveQuery(async () => eventPlayers(event), [event])

  if (!players) {
    return (
      <Paper withBorder shadow="md" p="md">
        <Text size="xs" c="dimmed">
          No players have been added yet
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
            <Table.Th>Standing</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>W/L/D</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Opp. Win Rate</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody ref={bodyRef}>
          {players?.map((player, index) => (
            <Table.Tr key={player.id}>
              <Table.Td>{index + 1}</Table.Td>
              <Table.Td>{player.name}</Table.Td>
              <Table.Td>
                [{player.wins}, {player.losses}, {player.draws}]
              </Table.Td>
              <Table.Td>{player.score} pts</Table.Td>
              <Table.Td>{player.opponentWinRate.toFixed(4)}%</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
