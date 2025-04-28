import { ActionIcon, Badge, Group, Table, Text } from '@mantine/core'
import { IconPencil } from '@tabler/icons-react'
import { Player } from '../../db'

export interface PlayerTableProps {
  players: Player[]
  onPlayerEdit(player: Player): void
}

export default function PlayerTable({ players, onPlayerEdit }: PlayerTableProps) {
  return (
    <>
      <Table striped>
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
                  {player.paid || <Badge color="orange">Unpaid</Badge>}
                  {player.dropped && <Badge color="red">Dropped</Badge>}
                </Group>
              </Table.Td>
              <Table.Td>{player.wins}</Table.Td>
              <Table.Td>{player.draws}</Table.Td>
              <Table.Td>{player.losses}</Table.Td>
              <Table.Td>{player.score}</Table.Td>
              <Table.Td>{(player.opponentWinRate * 100).toFixed(2)}%</Table.Td>
              <Table.Td ta="end">
                <ActionIcon variant="subtle" onClick={() => onPlayerEdit(player)}>
                  <IconPencil size={14} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  )
}
