import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Table,
  Text,
} from '@mantine/core'
import { Match, Player } from '../db'

interface MatchesTableProps {
  matches: Match[]
  players: Player[]
  currentRound: number | null
  onStartNewRound: () => void
  onUpdateMatch: (matchId: string, updates: Partial<Match>) => void
}

export function MatchesTable({ 
  matches, 
  players,
  currentRound, 
  onStartNewRound, 
  onUpdateMatch 
}: MatchesTableProps) {
  const roundMatches = currentRound === null ? [] : matches.filter(match => match.round === currentRound)
  const hasMatches = roundMatches.length > 0

  // Helper function to find a player by ID
  const findPlayer = (id: string) => players.find(p => p.id === id)

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text fw={500}>
          {currentRound === null ? 'Tournament Not Started' : `Round ${currentRound}`}
        </Text>
        <Button onClick={onStartNewRound}>
          {currentRound === null ? 'Start Tournament' : `Start Round ${currentRound + 1}`}
        </Button>
      </Group>

      {!hasMatches ? (
        <Text c="dimmed" ta="center" py="xl">
          {currentRound === null 
            ? 'No matches yet. Add players and click "Start Tournament" to begin.' 
            : 'No matches for this round yet.'}
        </Text>
      ) : (
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
              const player1 = findPlayer(match.player1Id)
              const player2 = match.player2Id ? findPlayer(match.player2Id) : undefined
              const winner = match.winnerId ? findPlayer(match.winnerId) : undefined
              
              return (
                <Table.Tr key={match.id}>
                  <Table.Td>{match.table}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text>{player1?.name}</Text>
                      {match.winnerId === match.player1Id && <Badge color="green">Winner</Badge>}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {player2 ? (
                      <Group gap="xs">
                        <Text>{player2.name}</Text>
                        {match.winnerId === match.player2Id && <Badge color="green">Winner</Badge>}
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
                      {!match.winnerId && !match.isDraw && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => onUpdateMatch(match.id, { winnerId: match.player1Id })}
                          >
                            ✓
                          </ActionIcon>
                          {match.player2Id && (
                            <>
                              <ActionIcon
                                variant="subtle"
                                color="yellow"
                                onClick={() => onUpdateMatch(match.id, { isDraw: true })}
                              >
                                =
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => onUpdateMatch(match.id, { winnerId: match.player2Id })}
                              >
                                ✓
                              </ActionIcon>
                            </>
                          )}
                        </>
                      )}
                      {(match.winnerId || match.isDraw) && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => onUpdateMatch(match.id, { winnerId: undefined, isDraw: false })}
                        >
                          ×
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      )}
    </div>
  )
} 