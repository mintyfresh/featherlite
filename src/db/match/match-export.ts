import { Match } from '../../db'
import matchGet from './match-get'

export type MatchExport = Match

export default async function matchExport(match: Match | string): Promise<MatchExport> {
  if (typeof match === 'string') {
    match = await matchGet(match)
  }

  return match
}
