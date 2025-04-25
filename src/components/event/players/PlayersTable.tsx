import { ActionIcon, Badge, Group, Table, Text } from '@mantine/core'
import { useMemo } from 'react'
import { Player } from '../../../db'

interface PlayersTableProps {
  players: Player[]
  onPlayerEdit(player: Player): void
}

export function PlayersTable({ players, onPlayerEdit }: PlayersTableProps) {
  const sortedPlayers = useMemo(() => {
    // If no games have been played, sort by name
    const preGameState = players.every((player) => player.score === 0)

    if (preGameState) {
      return players.sort((player1, player2) => {
        return player1.name.localeCompare(player2.name)
      })
    }

    return players.sort((player1, player2) => {
      if (player1.score !== player2.score) {
        return player2.score - player1.score
      } else {
        return player2.opponentWinRate - player1.opponentWinRate
      }
    })
  }, [players])

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
          {sortedPlayers.map((player) => (
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
