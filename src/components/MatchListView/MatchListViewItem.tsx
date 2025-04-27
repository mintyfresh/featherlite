import { ActionIcon, Badge, Group, Table, Text } from '@mantine/core'
import { Match, Player } from '../../db'

interface MatchListViewItemProps {
  match: Match
  player1: Player
  player2: Player | null
  matchUpdate(id: string, update: Partial<Match>): void
}

export default function MatchListViewItem({ match, player1, player2, matchUpdate }: MatchListViewItemProps) {
  let winner: Player | null = null

  if (match.winnerId === player1.id) {
    winner = player1
  } else if (match.winnerId === player2?.id) {
    winner = player2
  }

  return (
    <Table.Tr key={match.id}>
      <Table.Td>{match.table}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text>{player1.name}</Text>
          {winner === player1 && <Badge color="green">Winner</Badge>}
        </Group>
      </Table.Td>
      <Table.Td>
        {player2 ? (
          <Group gap="xs">
            <Text>{player2.name}</Text>
            {winner === player2 && <Badge color="green">Winner</Badge>}
          </Group>
        ) : (
          <Badge color="blue">BYE</Badge>
        )}
      </Table.Td>
      <Table.Td>
        {match.isDraw ? (
          <Badge color="yellow">Draw</Badge>
        ) : winner ? (
          <Text>{winner.name}</Text>
        ) : (
          <Text c="dimmed">Not played</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          {player2 && (
            <>
              <ActionIcon
                variant="subtle"
                color="green"
                onClick={() => matchUpdate(match.id, { winnerId: player1.id, isDraw: false })}
              >
                ✓
              </ActionIcon>
              <>
                <ActionIcon
                  variant="subtle"
                  color="yellow"
                  onClick={() => matchUpdate(match.id, { winnerId: null, isDraw: true })}
                >
                  =
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="green"
                  onClick={() => matchUpdate(match.id, { winnerId: player2.id, isDraw: false })}
                >
                  ✓
                </ActionIcon>
              </>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  )
}
