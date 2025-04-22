import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Table,
  Text,
} from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useMemo } from 'react'
import { db, Event, Player, Round } from '../../../db'
import matchUpdate from '../../../db/match-update'
import roundCreate from '../../../db/round-create'
import { generateSwissPairings } from '../../../utils/swissPairings'

interface RoundsTableProps {
  event: Event
  rounds: Round[]
  players: Player[]
}

export default function RoundsTable({
  event,
  rounds,
  players,
}: RoundsTableProps) {
  const roundIds = rounds.map((round) => round.id)
  const playerIds = players.map((player) => player.id)
  const currentRound = event.currentRound

  const playerIndex = useMemo(
    () => new Map<string, Player>(players.map((player) => [player.id, player])),
    [playerIds.join(',')]
  )

  const roundMatches = useLiveQuery(
    async () => await db.matches.where('roundId').anyOf(roundIds).toArray(),
    [roundIds.join(',')]
  )

  const startNextRound = useCallback(
    async () => {
      const matches = await generateSwissPairings(event.id)
      await roundCreate(event.id, { matches })
    },
    [event.id]
  )

  if (!roundMatches) {
    return (
      <Loader />
    )
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text fw={500}>
          {currentRound === null ? 'Tournament Not Started' : `Round ${currentRound}`}
        </Text>
        <Button onClick={() => startNextRound()}>
          {currentRound === null ? 'Start Tournament' : `Start Round ${currentRound + 1}`}
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Table</Table.Th>
            <Table.Th>Player 1</Table.Th>
            <Table.Th>Player 2</Table.Th>
            <Table.Th>Result</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {roundMatches.map((match) => {
            const player1 = playerIndex.get(match.playerIds[0])!
            const player2 = match.playerIds[1] ? playerIndex.get(match.playerIds[1]) : undefined
            const winner = match.winnerId ? playerIndex.get(match.winnerId) : undefined

            return (
              <Table.Tr key={match.id}>
                <Table.Td>{match.table}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Text>{player1?.name}</Text>
                    {match.winnerId === match.playerIds[0] && <Badge color="green">Winner</Badge>}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {player2 ? (
                    <Group gap="xs">
                      <Text>{player2.name}</Text>
                      {match.winnerId === match.playerIds[1] && <Badge color="green">Winner</Badge>}
                    </Group>
                  ) : (
                    <Badge color="blue">BYE</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {match.isDraw ? (
                    <Badge color="yellow">Draw</Badge>
                  ) : match.winnerId ? (
                    <Text>{winner?.name}</Text>
                  ) : (
                    <Text c="dimmed">Not played</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    {match.playerIds[1] && (
                      <>
                        <ActionIcon
                          variant="subtle"
                          color="green"
                          onClick={() => matchUpdate(match.id, { winnerId: match.playerIds[0], isDraw: false })}
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
                            onClick={() => matchUpdate(match.id, { winnerId: match.playerIds[1], isDraw: false })}
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
          })}
        </Table.Tbody>
      </Table>
    </div>
  )
} 