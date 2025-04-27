import { Card, Flex, Text, VisuallyHidden } from '@mantine/core'
import MatchCardPlayer from './MatchCardPlayer'
import MatchCardDivider from './MatchCardDivider'
import { Match, Player } from '../../db'

export interface MatchCardProps {
  match: Match
  player1: Player
  player2: Player | null
  onSelectWinner(player: Player): void
  onSetDraw(): void
}

export default function MatchCard({ match, player1, player2, onSelectWinner, onSetDraw }: MatchCardProps) {
  return (
    <Card key={match.id} withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Text fw={500}>Table {match.table}</Text>
      </Card.Section>
      <Card.Section ta="center">
        <Flex direction="column" justify="space-between" gap="md">
          <MatchCardPlayer
            match={match}
            player={player1}
            isWinner={match.winnerId === player1.id}
            pt="lg"
            onSelectWinner={() => onSelectWinner(player1)}
          />
          <MatchCardDivider match={match} onSetDraw={onSetDraw} />
          {player2 ? (
            <MatchCardPlayer
              match={match}
              player={player2}
              isWinner={match.winnerId === player2.id}
              pb="lg"
              onSelectWinner={() => onSelectWinner(player2)}
            />
          ) : (
            <VisuallyHidden>No player 2</VisuallyHidden>
          )}
        </Flex>
      </Card.Section>
    </Card>
  )
}
