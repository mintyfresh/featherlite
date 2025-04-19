import {
  ActionIcon,
  Badge,
  Group,
  Table,
  Text,
} from '@mantine/core'
import { Player } from '../db'

interface PlayerWithStats extends Player {
  stats: {
    wins: number
    draws: number
    losses: number
    score: number
    opponentWinPercentage: number
  }
}

interface PlayersTableProps {
  players: PlayerWithStats[]
  onEditPlayer: (player: Player) => void
  onDeletePlayer: (playerId: string) => void
}

export function PlayersTable({ players, onEditPlayer, onDeletePlayer }: PlayersTableProps) {
  return (
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
            <Table.Td>{player.stats.wins}</Table.Td>
            <Table.Td>{player.stats.draws}</Table.Td>
            <Table.Td>{player.stats.losses}</Table.Td>
            <Table.Td>{player.stats.score}</Table.Td>
            <Table.Td>{player.stats.opponentWinPercentage.toFixed(1)}%</Table.Td>
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <ActionIcon
                  variant="subtle"
                  onClick={() => onEditPlayer(player)}
                >
                  ✎
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => onDeletePlayer(player.id)}
                >
                  ×
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
} 