import combinations from 'combinations'
import { db, Event, Player } from '../db'
import eventGet from '../db/event/event-get'
import playerGet from '../db/player/player-get'
import type { PyodideInterface } from '#pyodide'

type Pairing = [string, string | null]

export async function preloadSwissDependencies() {
  await getPythonContext()
}

export default async function generateSwissPairings(event: Event | string): Promise<Pairing[]> {
  event = typeof event === 'string' ? await eventGet(event) : event

  const players = await db.players
    .where('eventId')
    .equals(event.id)
    .filter((player) => !player.dropped)
    .toArray()
  const edges = await generateWeightedEdges(players)

  const instance = await getPythonContext()
  instance.globals.set('edges', edges)

  const result: [string, string][] = (
    await instance.runPythonAsync(`
    import networkx as nx

    g = nx.Graph()
    g.add_weighted_edges_from(edges)

    paired = set()
    pairings = nx.max_weight_matching(g, True)
    result = []

    for p1, p2 in pairings:
      if p1 not in paired and p2 not in paired:
        paired.add(p1)
        paired.add(p2)
        result.append([p1, p2])

    result
  `)
  ).toJs()

  const pairings = result.map((pairing: [string, string]): [string, string | null] => {
    if (pairing[0] === 'BYE') {
      return [pairing[1], null]
    } else if (pairing[1] === 'BYE') {
      return [pairing[0], null]
    } else {
      return pairing
    }
  })

  return sortPairingsByRankings(pairings)
}

let pythonContext: Promise<PyodideInterface> | null = null

async function getPythonContext() {
  if (!pythonContext) {
    const pyodide = await import(/* @vite-ignore */ '#pyodide')
    pythonContext = pyodide.loadPyodide({ packages: ['micropip'] })

    const instance = await pythonContext
    await instance.runPythonAsync(`
      import micropip
      await micropip.install("networkx")
    `)
  }

  return pythonContext
}

async function generateWeightedEdges(players: Player[]) {
  const result: [string, string, number][] = []
  const items = (players.length % 2 === 0 ? players : [...players, null]).map((player) => player?.id ?? null)

  for (const [player1, player2] of combinations(items, 2, 2)) {
    const weight = await calculateWeightForPairing(player1!, player2)

    result.push([player1!, player2 ?? 'BYE', weight])
  }

  return result
}

async function calculateWeightForPairing(player1: Player | string, player2: Player | string | null) {
  if (typeof player1 === 'string') {
    player1 = await playerGet(player1)
  }

  if (typeof player2 === 'string') {
    player2 = await playerGet(player2)
  }

  const matches = await db.matches
    .where('playerIds')
    .equals(player1.id)
    .filter((match) => (player2 ? match.playerIds.includes(player2.id) : match.playerIds[1] === null))

  const previousMatchesCount = await matches.count()
  const penalty = previousMatchesCount * -999_999

  const player1Score = player1?.score ?? 0
  const player2Score = player2?.score ?? 0

  const min = Math.min(player1Score, player2Score)
  const max = Math.max(player1Score, player2Score)

  return (min + max) / 2 - Math.pow(max - min, 2) + penalty
}

async function sortPairingsByRankings(pairings: Pairing[]) {
  const rankings = new Map<string, number>(
    await Promise.all(
      pairings.map(async (pairing) => [pairing.join(','), await calculateWeightForPairing(...pairing)] as const)
    )
  )

  return pairings.sort((pair1, pair2) => {
    if (pair1[1] === null) {
      return +1
    } else if (pair2[1] === null) {
      return -1
    }

    const rank1 = rankings.get(pair1.join(',')) ?? 0
    const rank2 = rankings.get(pair2.join(',')) ?? 0

    return rank2 - rank1
  })
}
