import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Table,
  Text,
} from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Player } from '../../../db'
import playerBulkCalculateStats from '../../../db/player/player-bulk-calculate-stats'

interface PlayersTableProps {
  players: Player[]
  onPlayerEdit(player: Player): void
}

export function PlayersTable({ players, onPlayerEdit }: PlayersTableProps) {
  const playerIds = players.map((player) => player.id)
  const playerStats = useLiveQuery(
    async () => playerBulkCalculateStats(playerIds),
    [playerIds.join(',')]
  )

  const playersByRanking = useMemo(
    () => players.sort((player1, player2) => {
      const stats1 = playerStats?.get(player1.id)
      const stats2 = playerStats?.get(player2.id)

      if (!stats1 || !stats2) {
        return 0
      }

      if (stats1.score !== stats2.score) {
        return stats2.score - stats1.score
      } else {
        return stats2.opponentWinPercentage - stats1.opponentWinPercentage
      }
    }),
    [
      JSON.stringify(players),
      JSON.stringify(playerStats)
    ]
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
          {playersByRanking.map((player) => (
            <Table.Tr key={player.id}>
              <Table.Td>
                <Group gap="xs">
                  <Text>{player.name}</Text>
                  {player.paid || <Badge color="orange">Unpaid</Badge>}
                  {player.dropped && <Badge color="red">Dropped</Badge>}
                </Group>
              </Table.Td>
              <Table.Td>{playerStats.get(player.id)?.wins}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.draws}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.losses}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.score}</Table.Td>
              <Table.Td>{playerStats.get(player.id)?.opponentWinPercentage?.toFixed(2)}%</Table.Td>
              <Table.Td ta="end">
                <ActionIcon
                  variant="subtle"
                  onClick={() => onPlayerEdit(player)}
                >
                  ✎
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  )
} 