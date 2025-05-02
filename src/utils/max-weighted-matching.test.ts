import maxWeightedMatching, { WeightedGraphNode } from './max-weighted-matching'
import data from './max-weighted-matching.test.json'

const cases = data as { input: WeightedGraphNode<number>[]; output: [number, number][] }[]

describe('maxWeightMatching', () => {
  it('exists', () => {
    expect(maxWeightedMatching).toBeDefined()
  })

  test.each(cases)('returns the maximum weighted matching for case %#', ({ input, output }) => {
    const computed = toSortedEdges(maxWeightedMatching(input))
    const expected = toSortedEdges(output)
    expect(computed).toEqual(expected)
  })
})

function toSortedEdges(edges: [number, number][]) {
  return edges.map(([a, b]) => [a, b].sort((x, y) => x - y)).sort((a, b) => a[0] - b[0])
}
