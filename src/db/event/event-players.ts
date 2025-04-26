import { db, Event, Player } from '../../db'

export interface EventPlayersOptions {
  includeDropped?: boolean
  sortBy?: 'standing' | 'name' | 'auto'
}

export default async function eventPlayers(
  event: Event | string,
  { includeDropped = false, sortBy = 'auto' }: EventPlayersOptions = {}
) {
  const eventId = typeof event === 'string' ? event : event.id
  let players = await db.players.where('eventId').equals(eventId).toArray()

  if (!includeDropped) {
    players = players.filter((player) => !player.dropped)
  }

  if (sortBy === 'auto') {
    sortBy = determineSortOrder(players)
  }

  switch (sortBy) {
    case 'standing':
      players = sortPlayersByStanding(players)
      break
    case 'name':
      players = sortPlayersByName(players)
      break
  }

  return players
}

function determineSortOrder(players: Player[]): 'standing' | 'name' {
  const preGameState = players.every((player) => player.score === 0)

  return preGameState ? 'name' : 'standing'
}

function sortPlayersByStanding(players: Player[]) {
  return players.sort((player1, player2) => {
    if (player1.score === player2.score) {
      return player2.opponentWinRate - player1.opponentWinRate
    } else {
      return player2.score - player1.score
    }
  })
}

function sortPlayersByName(players: Player[]) {
  return players.sort((player1, player2) => player1.name.localeCompare(player2.name))
}
