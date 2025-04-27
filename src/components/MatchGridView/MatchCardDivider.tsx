import { Divider, Text } from '@mantine/core'
import { Match } from '../../db'

export interface MatchCardDividerProps {
  match: Match
  onSetDraw(): void
}

export default function MatchCardDivider({ match, onSetDraw }: MatchCardDividerProps) {
  const isBye = match.playerIds[1] === null
  const interactive = !isBye

  const colour = match.isDraw ? 'green' : 'black'
  const text = isBye ? 'BYE' : match.isDraw ? '<< TIE >>' : 'TIE'

  return (
    <Divider
      label={
        <Text role={interactive ? 'button' : undefined} fw={400} c={colour}>
          {text}
        </Text>
      }
      data-testid={`match-card-divider-${match.id}`}
      data-test-isdraw={match.isDraw}
      role={interactive ? 'button' : undefined}
      style={{ cursor: interactive ? 'pointer' : undefined }}
      onClick={() => interactive && onSetDraw()}
    />
  )
}
