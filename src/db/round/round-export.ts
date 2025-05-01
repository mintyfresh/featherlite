import { Round } from '../../db'
import matchExport from '../match/match-export'
import { MatchExport } from '../match/match-export'
import roundGet from './round-get'
import roundMatches from './round-matches'

export type RoundExport = Round & {
  matches: MatchExport[]
}

export default async function roundExport(round: Round | string): Promise<RoundExport> {
  if (typeof round === 'string') {
    round = await roundGet(round)
  }

  const matches = await roundMatches(round)

  return {
    ...round,
    matches: await Promise.all(matches.map(matchExport)),
  }
}
