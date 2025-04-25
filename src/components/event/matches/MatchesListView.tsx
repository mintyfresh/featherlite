import { Card, Divider, Flex, Loader, SimpleGrid, Text, UnstyledButton, UnstyledButtonProps } from '@mantine/core'
import { IconCrown } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Match, Player, Round, db } from '../../../db'
import matchUpdate from '../../../db/match/match-update'

interface MatchesListViewProps {
  round: Round
  players: Player[]
}

export default function MatchesListView({ round, players }: MatchesListViewProps) {
  const playerIndex = useMemo(
    () => new Map<string, Player>(players.map((player) => [player.id, player])),
    [JSON.stringify(players)]
  )

  const roundMatches = useLiveQuery(
    async () => await db.matches.where('roundId').equals(round.id).sortBy('table'),
    [round.id]
  )

  if (!roundMatches) {
    return <Loader />
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
      {roundMatches.map((match) => (
        <Card key={match.id} withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Text fw={500}>Table {match.table}</Text>
          </Card.Section>
          <Card.Section ta="center">
            <Flex direction="column" justify="space-between" gap="md">
              <MatchCardPlayer
                match={match}
                player={playerIndex.get(match.playerIds[0])!}
                isWinner={match.winnerId === match.playerIds[0]}
                pt="lg"
              />
              <MatchCardDivider match={match} />
              {match.playerIds[1] ? (
                <MatchCardPlayer
                  match={match}
                  player={playerIndex.get(match.playerIds[1])!}
                  isWinner={match.winnerId === match.playerIds[1]}
                  pb="lg"
                />
              ) : (
                <>&nbsp;</>
              )}
            </Flex>
          </Card.Section>
        </Card>
      ))}
    </SimpleGrid>
  )
}

interface MatchCardDividerProps {
  match: Match
}

function MatchCardDivider({ match }: MatchCardDividerProps) {
  const isBye = match.playerIds[1] === null

  const colour = match.isDraw ? 'green' : 'black'
  const text = isBye ? 'BYE' : match.isDraw ? '<< TIE >>' : 'TIE'

  return (
    <Divider
      label={
        <Text fw={400} c={colour}>
          {text}
        </Text>
      }
      role={!isBye ? 'button' : undefined}
      style={{ cursor: !isBye ? 'pointer' : undefined }}
      onClick={() => !isBye && matchUpdate(match.id, { isDraw: true, winnerId: null })}
    />
  )
}

interface MatchCardPlayerProps extends UnstyledButtonProps {
  match: Match
  player: Player
  isWinner: boolean
}

function MatchCardPlayer({ match, player, isWinner, ...props }: MatchCardPlayerProps) {
  return (
    <UnstyledButton
      fw="initial"
      c={isWinner ? 'green' : 'black'}
      variant="subtle"
      w="100%"
      ta="center"
      lh={1}
      {...props}
      onClick={() => matchUpdate(match.id, { winnerId: player.id, isDraw: false })}
    >
      <Flex align="center" justify="center" h="100%" style={{ overflow: 'visible' }}>
        <IconCrown />
        <Text component="span" ms="xs">
          {player.name}
        </Text>
      </Flex>
    </UnstyledButton>
  )
}
