import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Table,
  Text,
} from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { Player } from '../../../db'
import playerBulkCalculateStats from '../../../db/player-bulk-calculate-stats'

interface PlayersTableProps {
  players: Player[]
}

export function PlayersTable({ players }: PlayersTableProps) {
  const playerIds = players.map((player) => player.id)
  const playerStats = useLiveQuery(
    async () => playerBulkCalculateStats(playerIds),
    [playerIds.join(',')]
  )

  if (!playerStats) {
    return (
      <Loader />
    )
  }

  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Player</Table.Th>
            <Table.Th>Wins</Table.Th>
            <Table.Th>Draws</Table.Th>
            <Table.Th>Losses</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Opp. Win Rate</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {players.map((player) => (
            <Table.Tr key={player.id}>
              <Table.Td>
                <Group gap="xs">
                  <Text>{player.name}</Text>
                  {player.paid ? (
                    <Badge color="green">Paid</Badge>
                  ) : (
                    <Badge color="orange">Unpaid</Badge>
                  )}
                  {player.dropped && <Badge color="red">Dropped</Badge>}
                </Group>
              </Table.Td>
              <Table.Td>{playerStats.get(player.id)?.wins}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.draws}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.losses}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.score}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.opponentWinPercentage?.toFixed(2)}%</Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                  >
                    ✎
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                  >
                    ×
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  )
} 