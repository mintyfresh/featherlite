export type WeightedGraphNode<T extends string | number> = [T, T, number]

export default function maxWeightedMatching<T extends string | number>(edges: WeightedGraphNode<T>[]): [T, T][] {
  // Build set of distinct nodes and mapping to indices
  const nodes = new Set<T>()

  for (const [a, b] of edges) {
    nodes.add(a)
    nodes.add(b)
  }

  const nodeList = Array.from(nodes).sort((x, y) =>
    typeof x === 'number' ? x - (y as number) : x.localeCompare(y as string)
  )

  const m = nodeList.length
  const indexMap = new Map<T, number>()
  nodeList.forEach((node, idx) => indexMap.set(node, idx))

  // Precompute weight matrix
  const weight: number[][] = Array.from({ length: m }, () => Array(m).fill(0))
  for (const [a, b, w] of edges) {
    const i = indexMap.get(a)!
    const j = indexMap.get(b)!
    weight[i][j] = w
    weight[j][i] = w
  }

  const FULL_MASK = (1 << m) - 1
  const memo = new Map<number, { size: number; weight: number; matching: [number, number][] }>()

  function dfs(mask: number): { size: number; weight: number; matching: [number, number][] } {
    if (mask === 0) {
      return { size: 0, weight: 0, matching: [] }
    }

    const cached = memo.get(mask)
    if (cached) return cached

    // pick lowest-set bit u
    const lowBit = mask & -mask
    const u = Math.log2(lowBit)

    // Option: leave u unmatched
    let best = dfs(mask & ~(1 << u))

    // Option: match u with any other v in mask
    for (let v = u + 1; v < m; v++) {
      if ((mask >> v) & 1) {
        const w = weight[u][v]
        if (w >= -Infinity) {
          const next = dfs(mask & ~(1 << u) & ~(1 << v))
          const size = next.size + 1
          const totalW = next.weight + w
          if (size > best.size || (size === best.size && totalW > best.weight)) {
            best = { size, weight: totalW, matching: [...next.matching, [u, v]] }
          }
        }
      }
    }

    memo.set(mask, best)

    return best
  }

  const { matching } = dfs(FULL_MASK)

  // map indices back to nodes
  return matching.map(([i, j]) => [nodeList[i], nodeList[j]] as [T, T])
}
